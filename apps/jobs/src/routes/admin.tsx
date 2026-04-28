import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listUsers, createUser, deleteUser } from "@/server/functions/admin";
import {
  getLinkedinAdminSettings,
  runLinkedinSemanticDedupe,
  updateLinkedinAdminSettings,
} from "@/server/functions/linkedin-admin";
import { PageHero, PageSection } from "@spearyx/ui-kit";
import { Shield, Trash2 } from "lucide-react";

type AdminUser = { id: number; email: string; role: string; createdAt: string };
type LinkedinSettings = Awaited<ReturnType<typeof getLinkedinAdminSettings>>;

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { id: number; role: string } | null };
    if (!ctx.user) throw redirect({ to: "/login" });
    if (ctx.user.role !== "admin") throw redirect({ to: "/" });
  },
  component: AdminPage,
});

function AdminPage() {
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [settings, setSettings] = useState<LinkedinSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [runningLinkedinDedupe, setRunningLinkedinDedupe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function fetchUsers() {
    setSuccessMessage("");
    setLoadingUsers(true);
    try {
      setUserList(await listUsers({}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUserList([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    getLinkedinAdminSettings({})
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load settings"));
  }, []);

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      await createUser({ data: { email, password } });
      setEmail(""); setPassword("");
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!window.confirm("Delete this user and all their data?")) return;
    setError("");
    setSuccessMessage("");
    try {
      await deleteUser({ data: { userId } });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  }

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setError("");
    setSuccessMessage("");
    try {
      const next = await updateLinkedinAdminSettings({
        data: settings,
      });
      setSettings(next);
      setSuccessMessage("LinkedIn settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleRunLinkedinDedupe() {
    if (!window.confirm("Run LinkedIn dedupe now? This will permanently remove older duplicate job rows.")) {
      return;
    }

    setRunningLinkedinDedupe(true);
    setError("");
    setSuccessMessage("");
    try {
      const result = await runLinkedinSemanticDedupe({});
      setSuccessMessage(
        result.deletedCount > 0
          ? `LinkedIn dedupe complete. Removed ${result.deletedCount} duplicate jobs (${result.exactUrlDeletedCount} exact URL matches, ${result.semanticDeletedCount} semantic matches).`
          : "LinkedIn dedupe complete. No duplicate jobs were found.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run LinkedIn dedupe");
    } finally {
      setRunningLinkedinDedupe(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <PageHero
        eyebrow="Admin"
        icon={<Shield className="h-3.5 w-3.5" />}
        title="User Management"
        description="Manage jobs-app access, create accounts, and remove users when needed."
        stats={[
          { label: "Users", value: String(userList.length) },
          { label: "Admins", value: String(userList.filter((user) => user.role === "admin").length) },
        ]}
      />

      <PageSection
        title="Create User"
        description="Add a new user to the jobs application with an initial password."
      >
        <form onSubmit={handleAddUser} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
        {loadingUsers && <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>}
      </PageSection>

      <PageSection
        title="Current Users"
        description="Accounts with access to the jobs workspace."
        className="overflow-hidden p-0"
        contentClassName=""
      >
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {userList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No users yet
                </td>
              </tr>
            ) : (
              userList.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.createdAt?.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </PageSection>

      <PageSection
        title="LinkedIn Search Settings"
        description="Control retention, pruning, visibility, and how often saved LinkedIn searches are eligible to run."
      >
        {!settings ? (
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        ) : (
          <form onSubmit={handleSaveSettings} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Retention Days</span>
              <input
                type="number"
                min={1}
                max={365}
                value={settings.linkedinRetentionDays}
                onChange={(e) => setSettings({ ...settings, linkedinRetentionDays: Number(e.target.value || 14) })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Cron Frequency</span>
              <select
                value={settings.linkedinSearchCronFrequency}
                onChange={(e) => setSettings({ ...settings, linkedinSearchCronFrequency: e.target.value as LinkedinSettings["linkedinSearchCronFrequency"] })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
              >
                <option value="hourly">Hourly</option>
                <option value="every_6_hours">Every 6 Hours</option>
                <option value="daily">Daily</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm">
              <input
                type="checkbox"
                checked={settings.linkedinAutoPrune}
                onChange={(e) => setSettings({ ...settings, linkedinAutoPrune: e.target.checked })}
              />
              Enable Auto Prune
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm">
              <input
                type="checkbox"
                checked={settings.linkedinAllowAllUsersView}
                onChange={(e) => setSettings({ ...settings, linkedinAllowAllUsersView: e.target.checked })}
              />
              Allow All Users To View Shared History
            </label>

            <div className="md:col-span-2 xl:col-span-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {savingSettings ? "Saving..." : "Save LinkedIn Settings"}
                </button>
                <button
                  type="button"
                  onClick={handleRunLinkedinDedupe}
                  disabled={runningLinkedinDedupe}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                >
                  {runningLinkedinDedupe ? "Running Dedupe..." : "Run LinkedIn Dedupe"}
                </button>
              </div>
            </div>
          </form>
        )}
      </PageSection>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {successMessage && <p className="text-sm text-emerald-700">{successMessage}</p>}
    </div>
  );
}
