import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { PageHero, PageSection } from "@spearyx/ui-kit";

export const Route = createFileRoute("/")({ component: ToolsHomePage });

const tools = [
  {
    title: "RACI Generator",
    description: "Define roles and responsibilities with AI-assisted clarity.",
    icon: <BarChart3 size={18} className="text-primary-600" />,
    iconBg: "bg-primary-50 border-primary-100",
    href: "/raci-generator",
    available: true,
    status: "Available",
  },
  {
    title: "Project Charter Generator",
    description: "Turn project kickoff inputs into a structured charter.",
    icon: <FileText size={18} className="text-indigo-600" />,
    iconBg: "bg-indigo-50 border-indigo-100",
    href: "#",
    available: false,
    status: "Coming Soon",
  },
  {
    title: "Priority Matrix Generator",
    description: "Clarify what matters most when everything feels urgent.",
    icon: <Target size={18} className="text-amber-600" />,
    iconBg: "bg-amber-50 border-amber-100",
    href: "#",
    available: false,
    status: "Coming Soon",
  },
  {
    title: "Communications Plan",
    description: "Map messaging, audiences, and cadence for delivery alignment.",
    icon: <Zap size={18} className="text-sky-600" />,
    iconBg: "bg-sky-50 border-sky-100",
    href: "#",
    available: false,
    status: "Coming Soon",
  },
  {
    title: "Risk Register",
    description: "Capture threats, mitigation plans, and ownership in one place.",
    icon: <Shield size={18} className="text-rose-600" />,
    iconBg: "bg-rose-50 border-rose-100",
    href: "#",
    available: false,
    status: "Coming Soon",
  },
  {
    title: "Gantt Builder",
    description: "Translate planning inputs into a timeline your team can scan.",
    icon: <Calendar size={18} className="text-emerald-600" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    href: "#",
    available: false,
    status: "Coming Soon",
  },
];

const principles = [
  {
    title: "Built for working PMs",
    description:
      "Dense enough for real execution work, simple enough to move quickly.",
  },
  {
    title: "Consistent outputs",
    description:
      "Shared structure and defaults keep teams aligned across documents.",
  },
  {
    title: "AI where it helps",
    description:
      "Automation for drafting and structure — without obscuring judgment.",
  },
];

function ToolsHomePage() {
  const availableCount = tools.filter((t) => t.available).length;
  const plannedCount = tools.length - availableCount;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <PageHero
        eyebrow="Project Tools"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        title="AI tools for structured delivery"
        description="Focused project-management tools with clear inputs, practical outputs, and interfaces built for repeat work."
        stats={[
          { label: "Available Now", value: String(availableCount) },
          { label: "Planned", value: String(plannedCount) },
          { label: "Focus", value: "PM" },
        ]}
        actions={
          <Link
            to="/raci-generator"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Open RACI Generator
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* Cross-link: Jobs app */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0.02) 100%)",
          border: "1px solid rgba(99,102,241,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Also looking for your next role?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Spearyx Jobs offers AI match scoring, gap analysis, and application tracking for PM roles.
            </p>
          </div>
        </div>
        <a
          href="https://jobs.spearyx.com"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100"
        >
          Explore Jobs
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.75fr]">
        {/* Tool Library */}
        <PageSection
          title="Tool Library"
          description="A growing set of focused planning tools built with consistent interaction patterns."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) =>
              tool.available ? (
                <Link
                  key={tool.title}
                  to={tool.href}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-200/50 hover:shadow-md"
                >
                  <ToolCardContent tool={tool} />
                </Link>
              ) : (
                <div
                  key={tool.title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-5 opacity-70"
                >
                  <ToolCardContent tool={tool} />
                </div>
              )
            )}
          </div>
        </PageSection>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design principles */}
          <PageSection
            title="Design Principles"
            description="Shared patterns across Tools and Jobs."
          >
            <div className="space-y-3">
              {principles.map((principle, i) => (
                <div
                  key={principle.title}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{principle.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{principle.description}</p>
                </div>
              ))}
            </div>
          </PageSection>

          {/* Start here CTA */}
          <PageSection title="Start here">
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(220,38,38,0.04)",
                border: "1px solid rgba(220,38,38,0.12)",
              }}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-slate-900">RACI Generator</h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Build responsibility matrices, clean up role ambiguity, and export a shareable chart — no reformatting by hand.
              </p>
              <Link
                to="/raci-generator"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Open Tool
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </PageSection>
        </div>
      </section>
    </div>
  );
}

function ToolCardContent({ tool }: { tool: (typeof tools)[number] }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tool.iconBg}`}>
          {tool.icon}
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            tool.available
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {tool.status}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">{tool.title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">{tool.description}</p>

      <div className="mt-4 text-xs font-semibold text-primary-600">
        {tool.available ? "Open tool →" : "Planned"}
      </div>
    </>
  );
}
