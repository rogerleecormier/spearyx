import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
            is your partner in project excellence.
          </Body>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/tools"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2"
            >
              Explore Our Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
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
