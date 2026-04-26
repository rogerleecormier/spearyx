import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, X, Sparkles, BarChart3, FileText, Shield, Target, Calendar, Zap, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { Body, Headline } from "@spearyx/ui-kit";

export const Route = createFileRoute("/")({ component: App });

const tools = [
  {
    title: "RACI Chart Generator",
    description: "Define roles and responsibilities with crystal clarity",
    icon: <BarChart3 size={22} className="text-primary-600" />,
    iconBg: "from-red-50 to-orange-50 border-red-100",
    link: "/raci-generator",
    available: true,
    badge: "Available",
    badgeStyle: { background: "rgba(16,185,129,0.1)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" },
  },
  {
    title: "Project Charter Generator",
    description: "Launch projects with purpose and alignment",
    icon: <FileText size={22} className="text-indigo-600" />,
    iconBg: "from-indigo-50 to-violet-50 border-indigo-100",
    link: "#",
    available: false,
    badge: "Coming Soon",
    badgeStyle: { background: "rgba(148,163,184,0.1)", color: "#64748b", border: "1px solid rgba(148,163,184,0.25)" },
  },
  {
    title: "Priority Matrix Generator",
    description: "Make smarter prioritization decisions instantly",
    icon: <Target size={22} className="text-amber-600" />,
    iconBg: "from-amber-50 to-yellow-50 border-amber-100",
    link: "#",
    available: false,
    badge: "Coming Soon",
    badgeStyle: { background: "rgba(148,163,184,0.1)", color: "#64748b", border: "1px solid rgba(148,163,184,0.25)" },
  },
  {
    title: "Communications Plan",
    description: "Keep stakeholders informed and engaged",
    icon: <Zap size={22} className="text-sky-600" />,
    iconBg: "from-sky-50 to-blue-50 border-sky-100",
    link: "#",
    available: false,
    badge: "Coming Soon",
    badgeStyle: { background: "rgba(148,163,184,0.1)", color: "#64748b", border: "1px solid rgba(148,163,184,0.25)" },
  },
  {
    title: "Risk Register Generator",
    description: "Identify and mitigate threats proactively",
    icon: <Shield size={22} className="text-rose-600" />,
    iconBg: "from-rose-50 to-pink-50 border-rose-100",
    link: "#",
    available: false,
    badge: "Coming Soon",
    badgeStyle: { background: "rgba(148,163,184,0.1)", color: "#64748b", border: "1px solid rgba(148,163,184,0.25)" },
  },
  {
    title: "Gantt Chart Builder",
    description: "Visualize your timeline with precision",
    icon: <Calendar size={22} className="text-emerald-600" />,
    iconBg: "from-emerald-50 to-teal-50 border-emerald-100",
    link: "#",
    available: false,
    badge: "Coming Soon",
    badgeStyle: { background: "rgba(148,163,184,0.1)", color: "#64748b", border: "1px solid rgba(148,163,184,0.25)" },
  },
];

const whyItems = [
  {
    icon: <Clock size={18} className="text-amber-600" />,
    iconBg: "from-amber-50 to-yellow-50 border-amber-100",
    title: "Save 10+ Hours Weekly",
    description: "AI generators handle the heavy lifting. Create comprehensive project documents in minutes.",
  },
  {
    icon: <Target size={18} className="text-primary-600" />,
    iconBg: "from-red-50 to-orange-50 border-red-100",
    title: "Eliminate Ambiguity",
    description: "Define roles, risks, and communication strategies upfront. Reduce scope creep and confusion.",
  },
  {
    icon: <TrendingUp size={18} className="text-emerald-600" />,
    iconBg: "from-emerald-50 to-teal-50 border-emerald-100",
    title: "Deliver on Time",
    description: "Better upfront planning leads to better execution and consistent on-time delivery.",
  },
];

function App() {
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #ede9fe 100%)" }}>

      {/* Mesh glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "-5%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* ── Hero ── */}
      <section className="relative py-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-600 bg-white/70 border border-red-100 shadow-sm mb-8 backdrop-blur-sm">
            <Sparkles size={12} />
            AI-Powered Project Management
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-950 mb-6 tracking-tight leading-none">
            AI Precision for<br />
            <span style={{ background: "linear-gradient(135deg, #dc2626 0%, #9333ea 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Every PM
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Project managers are the tip of the spear — we arm you with AI-driven precision tools to deliver strategic clarity. Replace your spreadsheets and hit every delivery target.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
            <button
              disabled
              className="group px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2.5 cursor-not-allowed opacity-60"
              style={{ background: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" }}
            >
              Waitlist Coming Soon
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setShowLearnMoreModal(true)}
              className="px-8 py-3.5 rounded-xl font-semibold transition-all duration-200 text-slate-900"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}
            >
              Learn More
            </button>
          </div>

          <p className="text-sm text-slate-500 font-medium">
            Join 500+ project managers on our waitlist · Launching Q1 2026
          </p>
        </div>
      </section>

      {/* ── Why Spearyx ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="overline text-primary-600 mb-3">Why PMs Choose Spearyx</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">AI-Enhanced Tools for Strategic Excellence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyItems.map(({ icon, iconBg, title, description }) => (
              <div
                key={title}
                className="rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconBg} border mb-4`}>
                  {icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="overline text-primary-600 mb-3">AI-Powered Tools</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Your AI-Augmented PM Arsenal</h2>
            <p className="text-slate-600 max-w-xl mx-auto text-sm">Six intelligent generators designed to cover every critical phase of project planning and execution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map(({ title, description, icon, iconBg, link, available, badge, badgeStyle }) => (
              <a
                key={title}
                href={link}
                className={`group rounded-2xl p-6 transition-all duration-200 block ${available ? "hover:-translate-y-1 cursor-pointer" : "cursor-default"}`}
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", border: available ? "1px solid rgba(220,38,38,0.12)" : "1px solid rgba(226,232,240,0.7)", boxShadow: "0 4px 16px rgba(15,23,42,0.05)" }}
                onClick={(e) => { if (!available) e.preventDefault(); }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconBg} border`}>
                    {icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={badgeStyle}>{badge}</span>
                </div>
                <h3 className={`font-bold text-slate-900 mb-1.5 transition-colors ${available ? "group-hover:text-primary-600" : ""}`}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                {available && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary-600">
                    Open tool <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">How Spearyx Works</h2>
          </div>

          <div className="space-y-6">
            {[
              { n: "1", title: "Answer Key Questions", body: "Tell us about your project scope, team, timeline, and goals. Our AI analyzes your requirements intelligently." },
              { n: "2", title: "AI Generates Instantly", body: "Professionally formatted documents, charts, and plans using best practices — ready to share immediately." },
              { n: "3", title: "Execute with Clarity", body: "Crystal-clear documentation keeps your team aligned. Reduce ambiguity, prevent delays, deliver on time." },
            ].map(({ n, title, body }) => (
              <div
                key={n}
                className="flex gap-5 rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1px solid rgba(226,232,240,0.7)", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}>
                  {n}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, rgba(220,38,38,0.05) 0%, transparent 70%)" }} />
            <div className="relative">
              <CheckCircle2 size={40} className="text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                Ready for AI-Powered PM?
              </h2>
              <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                Join hundreds of project managers waiting for Spearyx. Be among the first to experience AI-augmented clarity, precision, and control.
              </p>
              <button
                disabled
                className="px-8 py-3.5 rounded-xl font-semibold text-white cursor-not-allowed opacity-60 inline-flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" }}
              >
                Waitlist Coming Soon
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t py-8 px-4" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", borderColor: "rgba(226,232,240,0.7)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/images/spearyx-logo.svg" alt="Spearyx" className="h-6 w-auto opacity-80" />
            <Body size="sm" className="text-slate-500">© 2025 Spearyx. All rights reserved.</Body>
          </div>
        </div>
      </footer>

      {/* ── Learn More Modal ── */}
      {showLearnMoreModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(226,232,240,0.9)", boxShadow: "0 24px 64px rgba(15,23,42,0.18)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Why Spearyx?</h2>
              <button onClick={() => setShowLearnMoreModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { title: "The Problem", body: "Project managers spend hours creating the same documents every project: RACI charts, charters, risk registers, communication plans. Critical, yet tedious — and often incomplete." },
                { title: "The Solution", body: "Spearyx uses AI to generate professional, comprehensive project documents in minutes. Our tools guide you through the right questions and produce publication-ready outputs." },
              ].map(({ title, body }) => (
                <div key={title}>
                  <Headline as="h3" className="text-slate-900 mb-2 text-base font-bold">{title}</Headline>
                  <Body size="base" className="text-slate-600">{body}</Body>
                </div>
              ))}

              <div>
                <Headline as="h3" className="text-slate-900 mb-3 text-base font-bold">What You Get</Headline>
                <ul className="space-y-2">
                  {["Crystal-clear project documentation", "10+ hours saved per project", "Reduced scope creep and ambiguity", "Better stakeholder communication", "On-time project delivery"].map((i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-4" style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)" }}>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-primary-600">Perfect for:</span>{" "}
                  Program managers, project leads, scrum masters, PMO teams, and anyone responsible for defining project scope and managing stakeholder expectations.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="w-full mt-8 px-4 py-2.5 rounded-xl font-semibold text-slate-700 transition-colors text-sm"
              style={{ background: "rgba(241,245,249,0.9)", border: "1px solid rgba(226,232,240,0.8)" }}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
