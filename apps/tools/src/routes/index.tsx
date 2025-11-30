import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import {
  Hero,
  Body,
  Overline,
  Headline,
  Card,
  CardTitle,
} from "@spearyx/ui-kit";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

  const tools = [
    {
      title: "RACI Chart Generator",
      description: "Define roles and responsibilities with crystal clarity",
      icon: "📊",
      link: "/raci-generator",
    },
    {
      title: "Project Charter Generator",
      description: "Launch projects with purpose and alignment",
      icon: "📋",
      link: "#",
    },
    {
      title: "Priority Matrix Generator",
      description: "Make smarter prioritization decisions instantly",
      icon: "🎯",
      link: "#",
    },
    {
      title: "Communications Plan Generator",
      description: "Keep stakeholders informed and engaged",
      icon: "💬",
      link: "#",
    },
    {
      title: "Risk Register Generator",
      description: "Identify and mitigate threats proactively",
      icon: "⚠️",
      link: "#",
    },
    {
      title: "Gantt Chart Builder",
      description: "Visualize your timeline with precision",
      icon: "📅",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Overline className="text-primary-600 mb-4">
            AI-Powered Project Management
          </Overline>

          <Hero className="text-4xl md:text-5xl lg:text-6xl text-slate-950 mb-6">
            AI-Powered Precision Project Management
          </Hero>

          <Body
            size="lg"
            className="text-slate-700 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Project Managers are the tip of the spear — we arm you with
            AI-driven precision tools to delivery strategic clarity to every
            project. Replace your spreadsheets and hit your delivery targets
            with confidence.
          </Body>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              disabled
              className="px-8 py-3 bg-slate-400 text-white rounded-lg font-semibold cursor-not-allowed flex items-center gap-2 opacity-75"
            >
              Waitlist Coming Soon
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLearnMoreModal(true)}
              className="px-8 py-3 bg-white border-2 border-slate-950 text-slate-950 rounded-lg font-semibold hover:bg-slate-50 transition-all duration-300"
            >
              Learn More
            </button>
          </div>

          {/* Trust Badge */}
          <Body size="sm" className="text-slate-500">
            Join 500+ project managers on our waitlist. Launching Q1 2026.
          </Body>
        </div>
      </section>

      {/* Why Spearyx Section */}
      <section className="py-24 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Overline className="text-primary-600 mb-4">
              Why Project Managers Choose Spearyx
            </Overline>
            <Headline className="text-2xl md:text-3xl lg:text-4xl text-slate-950 mb-4">
              AI-Enhanced Tools for Strategic Excellence
            </Headline>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="bg-white border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="text-4xl mb-4">⚡</div>
                <CardTitle className="text-slate-950 mb-3 text-lg">
                  Save 10+ Hours Weekly
                </CardTitle>
                <Body size="sm" className="text-slate-600">
                  AI-powered generators handle the heavy lifting. Create
                  comprehensive project documents in minutes with intelligent
                  assistance, not hours of manual work.
                </Body>
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="bg-white border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="text-4xl mb-4">🎯</div>
                <CardTitle className="text-slate-950 mb-3 text-lg">
                  Eliminate Ambiguity
                </CardTitle>
                <Body size="sm" className="text-slate-600">
                  Define roles, risks, and communication strategies upfront.
                  Reduce scope creep and stakeholder confusion with structured
                  clarity.
                </Body>
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="bg-white border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="p-8">
                <div className="text-4xl mb-4">📈</div>
                <CardTitle className="text-slate-950 mb-3 text-lg">
                  Deliver on Time
                </CardTitle>
                <Body size="sm" className="text-slate-600">
                  Strategic planning prevents delays. Better upfront planning
                  leads to better execution and on-time delivery.
                </Body>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Overline className="text-primary-600 mb-4">
              AI-Powered Tools
            </Overline>
            <Headline className="text-2xl md:text-3xl lg:text-4xl text-slate-950 mb-4">
              Your AI-Augmented Project Management Arsenal
            </Headline>
            <Body size="lg" className="text-slate-600 max-w-2xl mx-auto">
              Six intelligent AI-powered generators designed to cover every
              critical phase of project planning and execution
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <Card
                key={index}
                className="bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all duration-300 group block"
              >
                <a href={tool.link} className="block p-6">
                  <div className="text-4xl mb-3">{tool.icon}</div>
                  <CardTitle className="text-slate-950 mb-2 text-base group-hover:text-primary-600 transition-colors">
                    {tool.title}
                  </CardTitle>
                  <Body size="sm" className="text-slate-600">
                    {tool.description}
                  </Body>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Headline className="text-2xl md:text-3xl lg:text-4xl text-slate-950 mb-4">
              How AI-Powered Spearyx Works
            </Headline>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
              </div>
              <div className="flex-1">
                <Headline
                  as="h3"
                  className="!text-base text-slate-950 mb-2 font-semibold"
                >
                  Answer Key Questions
                </Headline>
                <Body size="base" className="text-slate-600">
                  Tell us about your project scope, team, timeline, and goals.
                  Our AI system analyzes your requirements and context
                  intelligently.
                </Body>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
              </div>
              <div className="flex-1">
                <Headline
                  as="h3"
                  className="!text-base text-slate-950 mb-2 font-semibold"
                >
                  AI Generates Instantly
                </Headline>
                <Body size="base" className="text-slate-600">
                  Our AI creates professionally formatted documents, charts, and
                  plans using best practices. Ready to share with your team
                  immediately.
                </Body>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
              </div>
              <div className="flex-1">
                <Headline
                  as="h3"
                  className="!text-base text-slate-950 mb-2 font-semibold"
                >
                  Execute with Clarity
                </Headline>
                <Body size="base" className="text-slate-600">
                  Keep your team aligned with crystal-clear documentation.
                  Reduce ambiguity, prevent delays, and deliver on time.
                </Body>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <Headline className="text-2xl md:text-3xl lg:text-4xl text-slate-950 mb-4">
            Ready for AI-Powered Project Management?
          </Headline>
          <Body size="lg" className="text-slate-600 mb-8">
            Join hundreds of project managers waiting for Spearyx. Be among the
            first to experience AI-augmented clarity, precision, and control.
          </Body>

          <button
            disabled
            className="px-8 py-3 bg-slate-400 text-white rounded-lg font-semibold cursor-not-allowed inline-flex items-center gap-2 opacity-75"
          >
            Waitlist Coming Soon
            <ArrowRight className="w-4 h-4" />
          </button>
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

      {/* Early Access Modal */}
      {showEarlyAccessModal && (
        <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <Headline as="h2" className="text-slate-950 mb-0">
                Coming Soon
              </Headline>
              <button
                onClick={() => setShowEarlyAccessModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <Body size="base" className="text-slate-600 mb-8">
              Spearyx is launching in{" "}
              <span className="font-bold text-primary-600">Q1 2026</span>. We're
              building the AI-powered tools project managers have been waiting
              for.
            </Body>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8">
              <Body size="sm" className="text-slate-600">
                <span className="font-semibold text-slate-950">
                  AI-Powered Tools Coming:
                </span>
                <ul className="mt-3 space-y-2">
                  <li>✓ AI RACI Chart Generator</li>
                  <li>✓ AI Project Charter Builder</li>
                  <li>✓ AI Priority Matrix Tool</li>
                  <li>✓ AI Risk Register Creator</li>
                  <li>✓ And more AI tools...</li>
                </ul>
              </Body>
            </div>

            <button
              onClick={() => setShowEarlyAccessModal(false)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Notify Me at Launch
            </button>
          </div>
        </div>
      )}

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 bg-slate-950/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Headline as="h2" className="text-slate-950 mb-0">
                Why Spearyx?
              </Headline>
              <button
                onClick={() => setShowLearnMoreModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <Headline
                  as="h3"
                  variant="semibold"
                  className="text-slate-950 mb-2 text-lg"
                >
                  The Problem
                </Headline>
                <Body size="base" className="text-slate-600">
                  Project managers spend hours creating the same documents every
                  project: RACI charts, project charters, risk registers,
                  communication plans. These foundational documents are critical
                  to success, yet they're tedious to create and often
                  incomplete.
                </Body>
              </div>

              <div>
                <Headline as="h3" className="text-slate-950 mb-2 text-lg">
                  The Solution
                </Headline>
                <Body size="base" className="text-slate-600">
                  Spearyx uses AI to generate professional, comprehensive
                  project documents in minutes. Our AI-powered tools guide you
                  through the right questions and produce publication-ready
                  outputs that keep your team aligned and your stakeholders
                  informed.
                </Body>
              </div>

              <div>
                <Headline as="h3" className="text-slate-950 mb-2 text-lg">
                  What You Get
                </Headline>
                <Body size="base" className="text-slate-600">
                  <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Crystal-clear project documentation</li>
                    <li>10+ hours saved per project</li>
                    <li>Reduced scope creep and ambiguity</li>
                    <li>Better stakeholder communication</li>
                    <li>On-time project delivery</li>
                    <li>Professional outputs ready to share</li>
                  </ul>
                </Body>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <Body size="sm" className="text-slate-700">
                  <span className="font-semibold text-primary-600">
                    Perfect for:
                  </span>{" "}
                  Program managers, project leads, scrum masters, PMO teams, and
                  anyone responsible for defining project scope and managing
                  stakeholder expectations.
                </Body>
              </div>
            </div>

            <button
              onClick={() => setShowLearnMoreModal(false)}
              className="w-full mt-8 px-4 py-2 bg-slate-200 text-black rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
