import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Wrench, Sparkles, BarChart3, Shield, Zap, Users } from "lucide-react";
import { Body } from "@spearyx/ui-kit";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #ede9fe 100%)" }}>

      {/* Mesh background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "-5%", width: "45vw", height: "45vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* ── Hero ── */}
      <section className="relative py-28 px-4">
        <div className="max-w-5xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-600 bg-white/70 border border-red-100 shadow-sm mb-8 backdrop-blur-sm">
            <Sparkles size={12} />
            Spearyx Platform
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-950 mb-6 tracking-tight leading-none">
            Strategic Clarity for<br />
            <span style={{ background: "linear-gradient(135deg, #dc2626 0%, #9333ea 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Modern Enterprises
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI-powered tools that empower project managers to deliver results with precision — from RACI charts to career intelligence. One platform, total clarity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <a
              href="https://tools.spearyx.com"
              className="group px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2.5 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "0 4px 16px rgba(220,38,38,0.35)" }}
            >
              Explore Our Tools
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="https://jobs.spearyx.com"
              className="group px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2.5 transition-all duration-200 text-slate-900"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}
            >
              <Briefcase size={16} className="text-primary-600" />
              Find Jobs
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "500+", label: "PMs on waitlist" },
              { value: "10k+", label: "Jobs indexed" },
              { value: "AI-First", label: "Every feature" },
            ].map(({ value, label }) => (
              <div key={label} className="min-w-[100px]">
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Row ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="overline text-primary-600 mb-3">Why Spearyx</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Built for how modern teams work</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles size={20} className="text-violet-600" />,
                iconBg: "from-violet-50 to-indigo-50 border-violet-100",
                title: "AI-Powered Analysis",
                description: "Advanced algorithms identify risks, optimize resource allocation, and score job-resume fit automatically.",
              },
              {
                icon: <Shield size={20} className="text-primary-600" />,
                iconBg: "from-red-50 to-orange-50 border-red-100",
                title: "Strategic Alignment",
                description: "Every project deliverable maps directly to your organization's strategic goals — no ambiguity.",
              },
              {
                icon: <Zap size={20} className="text-amber-600" />,
                iconBg: "from-amber-50 to-yellow-50 border-amber-100",
                title: "Real-time Intelligence",
                description: "Live updates, smart scoring, and automated workflows keep your team and job search always current.",
              },
            ].map(({ icon, iconBg, title, description }) => (
              <div
                key={title}
                className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconBg} border mb-4`}>
                  {icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="overline text-primary-600 mb-3">Our Ecosystem</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Everything You Need to Succeed</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Spearyx Tools */}
            <div
              className="relative rounded-2xl p-8 overflow-hidden group transition-all duration-200 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(220,38,38,0.05) 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 flex items-center justify-center text-2xl mb-6 shadow-sm">
                  <Wrench size={22} className="text-primary-600" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 mb-3">
                  <Sparkles size={10} />
                  AI-Powered
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Spearyx Tools</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  A suite of intelligent project management tools — generate RACI charts, risk registers, project charters and more with AI assistance in seconds.
                </p>
                <ul className="space-y-1.5 mb-6">
                  {["RACI Chart Generator", "Project Charter Builder", "Risk Register Creator"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://tools.spearyx.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 group-hover:gap-3 transition-all"
                >
                  Explore Tools <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Spearyx Jobs */}
            <div
              className="relative rounded-2xl p-8 overflow-hidden group transition-all duration-200 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(226,232,240,0.8)", boxShadow: "0 8px 32px rgba(15,23,42,0.08)" }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(99,102,241,0.05) 0%, transparent 70%)" }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
                  <Briefcase size={22} className="text-indigo-600" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 mb-3">
                  <BarChart3 size={10} />
                  Smart Scoring
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Spearyx Jobs</h3>
                <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                  AI-curated tech jobs with JD-resume match scoring, application tracking, cover letter generation, and unicorn opportunity detection.
                </p>
                <ul className="space-y-1.5 mb-6">
                  {["AI JD-Resume Analysis", "Job Application Tracking", "Cover Letter Generator"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://jobs.spearyx.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all"
                >
                  Browse Jobs <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Feature Highlight ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.06) 50%, rgba(59,130,246,0.06) 100%)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(16px)" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
            <div className="relative text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#7c3aed" }}>
                <Sparkles size={12} />
                AI-First Platform
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                AI intelligence in every feature
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                From generating RACI matrices to scoring job-resume fit, every Spearyx feature is backed by AI — saving hours of manual work and surfacing insights you'd otherwise miss.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "RACI AI Generation",
                  "Resume Tailoring",
                  "JD Analysis",
                  "Job Scoring",
                  "Cover Letters",
                  "Unicorn Detection",
                ].map((feat) => (
                  <span
                    key={feat}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(226,232,240,0.8)", color: "#374151" }}
                  >
                    {feat}
                  </span>
                ))}
              </div>
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
          <div className="flex items-center gap-6">
            <a href="https://tools.spearyx.com" className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">Tools</a>
            <a href="https://jobs.spearyx.com" className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">Jobs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
