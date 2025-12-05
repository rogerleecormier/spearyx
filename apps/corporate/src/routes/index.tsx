import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Briefcase } from "lucide-react";
import { Hero, Body, Overline, FeaturedCard } from "@spearyx/ui-kit";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Overline className="text-primary-600 mb-4">
            Spearyx Corporate
          </Overline>

          <Hero className="text-slate-950 mb-6">
            Strategic Clarity for Modern Enterprises
          </Hero>

          <Body
            size="lg"
            className="text-slate-700 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            We build intelligent tools that empower project managers to deliver
            results with precision. From RACI charts to risk registers, Spearyx
            is your partner in project excellence. Now with Spearyx Jobs, find your next career move in the tech industry.
          </Body>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="https://tools.spearyx.com"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2"
            >
              Explore Our Tools
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="https://jobs.spearyx.com"
              className="px-8 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-300 flex items-center gap-2"
            >
              Find Jobs
              <Briefcase className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeaturedCard
              title="AI-Powered Analysis"
              description="Leverage advanced algorithms to identify risks and optimize resource allocation automatically."
              icon={<span className="text-2xl">🤖</span>}
              accentColor="primary"
            />
            <FeaturedCard
              title="Strategic Alignment"
              description="Ensure every project deliverable maps directly to your organization's strategic goals."
              icon={<span className="text-2xl">🎯</span>}
              accentColor="slate"
            />
            <FeaturedCard
              title="Real-time Collaboration"
              description="Empower your teams to work together seamlessly with live updates and shared workspaces."
              icon={<span className="text-2xl">🤝</span>}
              accentColor="accent"
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-12">
            <Overline className="text-primary-600 mb-2">Our Ecosystem</Overline>
            <h2 className="text-3xl font-bold text-slate-900">
              Everything You Need to Succeed
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Spearyx Tools
              </h3>
              <p className="text-slate-600 mb-6">
                A suite of intelligent project management tools designed to
                streamline your workflow. Generate RACI charts, risk registers,
                and more with AI assistance.
              </p>
              <a
                href="https://tools.spearyx.com"
                className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Explore Tools <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Spearyx Jobs
              </h3>
              <p className="text-slate-600 mb-6">
                Discover your next opportunity with our curated job board. We
                aggregate the best tech jobs from top companies, making your
                search efficient and effective.
              </p>
              <a
                href="https://jobs.spearyx.com"
                className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Browse Jobs <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>


      </section>

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-slate-100 py-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/spearyx-logo.svg"
                alt="Spearyx"
                className="h-6 w-auto"
              />
              <Body size="sm" className="text-slate-600">
                © 2025 Spearyx. All rights reserved.
              </Body>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
