import { createFileRoute } from "@tanstack/react-router";
import {
  createSync,
  addSyncLog,
  completeSync,
  getSync,
  subscribeToSync,
  unsubscribeFromSync,
} from "../../lib/jobs/sync-state";
import {
  createSyncReport,
  updateDiscoveryStats,
  updateJobStats,
  finalizeSyncReport,
  formatSyncReport,
  parseDiscoveryOutput,
  parseJobSyncOutput,
  addTopJob,
} from "../../lib/jobs/sync-report";
import type { SyncReport } from "../../lib/jobs/sync-report";
import { getDbFromContext } from "../../db/db";
import { discoverGreenhouseCompanies } from "../../lib/jobs/job-sources/discover-greenhouse-companies";
import { syncJobs } from "../../lib/jobs/job-sync";

export const Route = createFileRoute("/api/sync-stream")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const ctx = context as any;
        console.log("🔍 Sync-stream endpoint called");
        console.log("🔍 Context keys:", ctx ? Object.keys(ctx) : "no context");
        console.log(
          "🔍 Context.cloudflare:",
          ctx ? !!ctx.cloudflare : "no context"
        );
        console.log("🔍 Context.env:", ctx ? !!ctx.env : "no context");

        let db;
        try {
          console.log("🔍 Attempting to get DB from context...");
          db = await getDbFromContext(ctx);
          console.log("✅ DB connection successful");
        } catch (error) {
          console.error("❌ DB connection failed:", error);
          return new Response(
            JSON.stringify({
              error: "Database connection failed",
              details: String(error),
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const url = new URL(request.url);
        const cleanup = url.searchParams.get("cleanup") === "true";
        const discovery = url.searchParams.get("discovery") === "true";
        const maintenance = url.searchParams.get("maintenance") === "true";
        const updateExisting =
          url.searchParams.get("updateExisting") === "true";
        const addNew = url.searchParams.get("addNew") === "true";
        const sourcesParam = url.searchParams.get("sources");
        const sources = sourcesParam ? sourcesParam.split(",") : undefined;
        const reconnectId = url.searchParams.get("syncId");

        const encoder = new TextEncoder();
        let isControllerClosed = false;

        const stream = new ReadableStream({
          async start(controller) {
            // Keep connection alive with periodic comments
            const keepAliveInterval = setInterval(() => {
              if (isControllerClosed) {
                clearInterval(keepAliveInterval);
                return;
              }
              try {
                const message = `: keep-alive\n\n`;
                controller.enqueue(encoder.encode(message));
              } catch (error) {
                // If we can't write, the controller is probably closed
                isControllerClosed = true;
                clearInterval(keepAliveInterval);
              }
            }, 10000); // Send every 10 seconds

            const sendEvent = (data: any) => {
              if (isControllerClosed) return;
              try {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
              } catch (error) {
                console.error("Error sending event:", error);
                isControllerClosed = true;
              }
            };

            // Handle client disconnect
            request.signal.addEventListener("abort", () => {
              isControllerClosed = true;
              clearInterval(keepAliveInterval);
              try {
                controller.close();
              } catch (e) {
                // Ignore if already closed
              }
            });

            // If reconnecting to existing sync
            if (reconnectId) {
              const existingSync = getSync(reconnectId);
              if (existingSync) {
                sendEvent({ type: "reconnect", syncId: reconnectId });

                // Send history
                existingSync.logs.forEach((log) => {
                  sendEvent({
                    type: "log",
                    message: log.message,
                    level: log.type,
                  });
                });

                if (existingSync.status === "complete") {
                  const duration =
                    existingSync.endTime! - existingSync.startTime;
                  sendEvent({ type: "complete", duration });
                  clearInterval(keepAliveInterval);
                  controller.close();
                  return;
                } else if (existingSync.status === "error") {
                  sendEvent({
                    type: "error",
                    message: existingSync.error || "Unknown error",
                  });
                  clearInterval(keepAliveInterval);
                  controller.close();
                  return;
                }

                // If still running, subscribe to updates
                const listener = (event: any) => {
                  sendEvent(event);
                  if (event.type === "complete" || event.type === "error") {
                    clearInterval(keepAliveInterval);
                    try {
                      controller.close();
                    } catch (e) {}
                    unsubscribeFromSync(reconnectId, listener);
                  }
                };

                subscribeToSync(reconnectId, listener);

                // Cleanup listener on abort
                request.signal.addEventListener("abort", () => {
                  clearInterval(keepAliveInterval);
                  unsubscribeFromSync(reconnectId, listener);
                });

                // Wait for completion if reconnecting
                await new Promise<void>((resolve) => {
                  const checkInterval = setInterval(() => {
                    const currentSync = getSync(reconnectId);
                    if (
                      !currentSync ||
                      currentSync.status === "complete" ||
                      currentSync.status === "error" ||
                      isControllerClosed
                    ) {
                      clearInterval(checkInterval);
                      resolve();
                    }
                  }, 1000);
                });

                return;
              } else {
                sendEvent({ type: "error", message: "Sync session not found" });
                clearInterval(keepAliveInterval);
                controller.close();
                return;
              }
            }

            // Create new sync state
            const syncState = createSync(
              cleanup || discovery || updateExisting || addNew || maintenance
            );
            sendEvent({ type: "sync_started", syncId: syncState.id });

            // Subscribe to updates immediately
            const listener = (event: any) => {
              sendEvent(event);
              if (event.type === "complete" || event.type === "error") {
                try {
                  controller.close();
                } catch (e) {}
                unsubscribeFromSync(syncState.id, listener);
              }
            };
            subscribeToSync(syncState.id, listener);

            request.signal.addEventListener("abort", () => {
              unsubscribeFromSync(syncState.id, listener);
            });

            const sendLog = (
              message: string,
              level: "info" | "success" | "error" | "warning" = "info"
            ) => {
              addSyncLog(syncState.id, message, level);
            };

            try {
              const startTime = Date.now();

              // Create sync report
              const syncReport = createSyncReport();
              syncState.report = syncReport;

              sendLog(
                "🚀 Starting job sync process (Cloudflare D1 Mode)...",
                "info"
              );
              sendLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");
              sendLog("", "info");

              // Step 1: Discovery
              if (discovery) {
                sendLog("🔍 Step 1: Company Discovery", "info");
                sendLog("Searching for new SaaS and tech companies...", "info");
                const discoveryStart = Date.now();

                try {
                  // Greenhouse Discovery
                  sendLog("Running Greenhouse Discovery...", "info");
                  const ghStats = await discoverGreenhouseCompanies(
                    db,
                    sendLog,
                    request.signal
                  );

                  updateDiscoveryStats(syncReport, {
                    companiesTested: ghStats.tested,
                    companiesDiscovered: ghStats.discovered,
                    companiesRemoved: { greenhouse: [], lever: [] },
                  });

                  // Lever Discovery (TODO)
                  sendLog(
                    "⚠️ Lever Discovery not yet migrated to D1",
                    "warning"
                  );

                  const discoveryDuration = (
                    (Date.now() - discoveryStart) /
                    1000
                  ).toFixed(1);
                  sendLog(
                    `✅ Discovery completed in ${discoveryDuration}s`,
                    "success"
                  );
                } catch (error) {
                  if (!request.signal.aborted) {
                    sendLog(`⚠️  Discovery had errors: ${error}`, "warning");
                  }
                }
                sendLog("", "info");
              }

              // Step 2: Cleanup
              if (cleanup) {
                sendLog("🧹 Step 2: Cleanup", "info");
                sendLog("⚠️ Cleanup scripts not yet migrated to D1", "warning");
                sendLog("", "info");
              }

              // Step 3: Maintenance (Cleanup Jobs)
              if (maintenance) {
                sendLog("🔧 Step 3: Maintenance", "info");
                sendLog(
                  "⚠️ Maintenance scripts not yet migrated to D1",
                  "warning"
                );
                sendLog("", "info");
              }

              // Step 4: Sync
              if (updateExisting || addNew) {
                sendLog("📥 Step 4: Job Sync", "info");
                const syncStart = Date.now();

                try {
                  sendLog("Syncing jobs from configured sources...", "info");
                  const result = await syncJobs({
                    updateExisting,
                    addNew,
                    sources,
                    db,
                    onLog: sendLog,
                  });

                  updateJobStats(syncReport, {
                    jobsAdded: result.added,
                    jobsUpdated: result.updated,
                    jobsSkipped: result.skipped,
                  });

                  const syncDuration = (
                    (Date.now() - syncStart) /
                    1000
                  ).toFixed(1);
                  sendLog(
                    `✅ Job sync completed in ${syncDuration}s`,
                    "success"
                  );
                  sendLog(`   Added: ${result.added}`, "info");
                  sendLog(`   Updated: ${result.updated}`, "info");
                  sendLog(`   Skipped: ${result.skipped}`, "info");
                } catch (error) {
                  if (!request.signal.aborted) {
                    sendLog(`⚠️  Job sync had errors: ${error}`, "warning");
                  }
                }
                sendLog("", "info");
              } else {
                sendLog(
                  "ℹ️  Job sync skipped (neither update nor new jobs selected)",
                  "info"
                );
              }

              sendLog("", "info");
              sendLog(
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                "success"
              );

              // Finalize and send report
              finalizeSyncReport(syncReport);
              const reportText = formatSyncReport(syncReport);
              sendLog(reportText, "success");

              // Send report as separate event for UI display
              sendEvent({
                type: "report",
                report: syncReport,
              });

              completeSync(syncState.id);
            } catch (error) {
              if (!request.signal.aborted) {
                sendLog("", "error");
                sendLog(
                  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                  "error"
                );
                const errorMessage =
                  error instanceof Error ? error.message : "Unknown error";
                completeSync(syncState.id, errorMessage);
              }
            } finally {
              clearInterval(keepAliveInterval);
              if (request.signal.aborted) {
                try {
                  controller.close();
                } catch (e) {}
              }
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
