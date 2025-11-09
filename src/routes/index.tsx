import { createFileRoute } from "@tanstack/react-router";
import { Target, ArrowRight, Sparkles } from "lucide-react";
import {
  Hero,
  Subtitle,
  Display,
  Body,
  Overline,
  Headline,
} from "@/components/Typography";
import {
  FeaturedCard,
  ComingSoonCard,
  InteractiveCard,
} from "@/components/Cards";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const tools = [
    {
      title: "RACI Chart Generator",
      description:
        "Define roles and responsibilities with crystal clarity. Create RACI matrices that eliminate confusion about who is Responsible, Accountable, Consulted, and Informed on every project task.",
      icon: "📊",
      accentColor: "primary" as const,
    },
    {
      title: "Project Charter Generator",
      description:
        "Launch projects with purpose. Generate comprehensive project charters that align stakeholders, define scope, and establish the foundation for project success.",
      icon: "📋",
      accentColor: "primary" as const,
    },
    {
      title: "Priority Matrix Generator",
      description:
        "Make smarter prioritization decisions instantly. Create impact-vs-effort matrices to visualize which tasks deliver the most value with optimal resource allocation.",
      icon: "🎯",
      accentColor: "primary" as const,
    },
    {
      title: "Communications Plan Generator",
      description:
        "Keep everyone in the loop. Build strategic communication plans that ensure the right message reaches the right stakeholders at the right time.",
      icon: "💬",
      accentColor: "primary" as const,
    },
    {
      title: "Risk Register Generator",
      description:
        "Identify and mitigate threats before they become problems. Create comprehensive risk registers with assessment and mitigation strategies.",
      icon: "⚠️",
      accentColor: "accent" as const,
    },
    {
      title: "Gantt Chart Builder",
      description:
        "Visualize your timeline with precision. Generate interactive Gantt charts that show task dependencies, milestones, and critical paths at a glance.",
      icon: "📅",
      accentColor: "accent" as const,
    },
    {
      title: "Stakeholder Analysis Tool",
      description:
        "Understand your audience. Map stakeholder interests and influence to develop targeted engagement strategies for every project phase.",
      icon: "👥",
      accentColor: "accent" as const,
    },
    {
      title: "Resource Capacity Planner",
      description:
        "Optimize your team's potential. Allocate resources intelligently across projects and identify capacity constraints before bottlenecks occur.",
      icon: "⚙️",
      accentColor: "accent" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section with Modern Design */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32 overflow-hidden bg-white">
        <div className="text-center max-w-4xl relative z-10">
          {/* Main Heading */}
          <div className="mb-8">
            <div className="inline-block">
              <Overline className="text-red-600">Introducing</Overline>
            </div>
            <Hero className="text-black mt-4 mb-4">SPEARYX</Hero>
            <div className="h-1 w-24 mx-auto bg-red-600 rounded-full"></div>
          </div>

          {/* Professional Tagline */}
          <Subtitle className="text-black mb-8 text-2xl">
            Precision Project Management
          </Subtitle>

          {/* Description with Highlights */}
          <Body size="lg" className="text-slate-700 mb-12 leading-relaxed">
            Cut through the noise with{" "}
            <span className="font-semibold text-red-600">clarity</span>. Hit
            your <span className="font-semibold text-black">targets</span> with{" "}
            <span className="font-semibold text-red-600">precision</span>.
            Manage projects with{" "}
            <span className="font-semibold text-black">focus</span>.
          </Body>

          {/* Coming Soon Badge */}
          <div className="inline-block group mb-12">
            <div className="relative px-6 py-2 bg-red-50 rounded-full border-2 border-red-200">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-black">
                <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                Coming Soon • Waitlist Open
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 hover:scale-105">
              Get Early Access
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-3 bg-white border-2 border-black text-black rounded-lg font-semibold hover:bg-slate-50 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-24 px-4 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Overline className="text-red-600 mb-4">Core Tools</Overline>
            <Headline className="text-black mb-4">
              Essential Project Management
            </Headline>
            <Body size="lg" className="text-slate-700 max-w-2xl mx-auto">
              Master the fundamentals with our comprehensive suite of project
              management generators
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.slice(0, 4).map((tool, index) => (
              <div
                key={index}
                className="group bg-white border border-slate-300 rounded-xl p-6 hover:border-red-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{tool.icon}</div>
                <Headline as="h3" className="text-black mb-3 text-lg">
                  {tool.title}
                </Headline>
                <Body size="sm" className="text-slate-700 line-clamp-2">
                  {tool.description}
                </Body>
                <div className="mt-4 pt-4 border-t border-slate-300">
                  <Body size="sm" className="text-slate-600 font-semibold">
                    Q1 2026
                  </Body>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extended Tools Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Overline className="text-red-600 mb-4">Advanced Features</Overline>
            <Headline className="text-black mb-4">And More Coming</Headline>
            <Body size="lg" className="text-slate-700 max-w-2xl mx-auto">
              Expand your toolkit with advanced project management capabilities
            </Body>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.slice(4).map((tool, index) => (
              <div
                key={index}
                className="group bg-white border border-slate-300 rounded-xl p-6 hover:border-red-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{tool.icon}</div>
                <Headline as="h3" className="text-black mb-3 text-lg">
                  {tool.title}
                </Headline>
                <Body size="sm" className="text-slate-700 line-clamp-2">
                  {tool.description}
                </Body>
                <div className="mt-4 pt-4 border-t border-slate-300">
                  <Body size="sm" className="text-slate-600 font-semibold">
                    Q1 2026
                  </Body>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-24 px-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-12 text-center">
            <Headline className="text-black mb-4">
              Ready to Transform Your Projects?
            </Headline>
            <Body size="lg" className="text-slate-700 mb-8 max-w-2xl mx-auto">
              Join our growing waitlist for early access to Spearyx and be among
              the first to experience precision project management.
            </Body>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 hover:scale-105">
                Get Early Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-3 bg-white border-2 border-black text-black rounded-lg font-semibold hover:bg-slate-50 transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Secondary Info */}
            <Body size="sm" className="text-slate-600 mt-6">
              No spam, no obligations. We'll keep you updated on our progress.
            </Body>
          </div>
        </div>
      </section>

      {/* Footer with Logo */}
      <footer className="border-t border-slate-300 bg-black py-16 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand with Logo */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo192.png"
                  alt="Spearyx"
                  className="w-10 h-10 rounded"
                />
                <Headline className="text-white mb-0 text-xl">Spearyx</Headline>
              </div>
              <Body size="sm" className="text-slate-400">
                Precision project management tools for teams that deliver
              </Body>
            </div>

            {/* Product Links */}
            <div>
              <Headline className="text-white mb-4 text-lg" as="h4">
                Product
              </Headline>
              <ul className="space-y-2">
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Features
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Roadmap
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Pricing
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Status
                  </Body>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <Headline className="text-white mb-4 text-lg" as="h4">
                Company
              </Headline>
              <ul className="space-y-2">
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    About
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Blog
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Contact
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Careers
                  </Body>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <Headline className="text-white mb-4 text-lg" as="h4">
                Legal
              </Headline>
              <ul className="space-y-2">
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Privacy
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Terms
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Cookies
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    Security
                  </Body>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright & Social */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <Body size="sm" className="text-slate-400">
                © 2025 Spearyx. All rights reserved.
              </Body>
              <div className="flex gap-6 mt-4 sm:mt-0">
                <Body
                  size="sm"
                  className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  Twitter
                </Body>
                <Body
                  size="sm"
                  className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  LinkedIn
                </Body>
                <Body
                  size="sm"
                  className="text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  GitHub
                </Body>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex flex-col">
      {/* Hero Section with Modern Design */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32 overflow-hidden">
        {/* Decorative gradient blur background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-subtle"></div>
          <div
            className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-subtle"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute -bottom-10 left-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-subtle"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="text-center max-w-4xl mb-20 relative z-10">
          {/* Main Heading with Gradient */}
          <div className="mb-8">
            <div className="inline-block">
              <Overline className="text-red-500 animate-fade-in">
                Introducing
              </Overline>
            </div>
            <Hero className="text-gradient-primary mt-4 mb-2 animate-fade-in">
              SPEARYX
            </Hero>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500 rounded-full"></div>
          </div>

          {/* Professional Tagline */}
          <Subtitle className="text-slate-700 mb-8 text-2xl">
            Precision Project Management
          </Subtitle>

          {/* Description with Highlights */}
          <Body size="lg" className="text-slate-700 mb-12 leading-relaxed">
            Cut through the noise with{" "}
            <span className="font-semibold text-red-500">clarity</span>. Hit
            your <span className="font-semibold text-indigo-500">targets</span>{" "}
            with{" "}
            <span className="font-semibold text-emerald-600">precision</span>.
            Manage projects with{" "}
            <span className="font-semibold text-slate-900">focus</span>.
          </Body>

          {/* Enhanced Coming Soon Badge with Micro-interactions */}
          <div className="inline-block group">
            <div className="relative">
              {/* Animated glow background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-indigo-400 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>

              {/* Badge content */}
              <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white px-8 py-5 rounded-xl shadow-lg hover-lift transition-all duration-300 border border-red-400 border-opacity-30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 animate-pulse" />
                  <span className="text-sm font-semibold tracking-wider">
                    COMING SOON
                  </span>
                </div>
                <p className="text-sm text-red-50 font-medium">
                  Targeting Q1 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Value Props with Enhanced Design */}
        <div className="mb-24 max-w-5xl w-full px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <InteractiveCard
              title="Crystal Clear"
              description="Complete transparency across every phase"
              icon="✓"
              accentColor="primary"
            />
            <InteractiveCard
              title="Precision-Focused"
              description="Laser-sharp accuracy in planning"
              icon="🎯"
              accentColor="secondary"
            />
            <InteractiveCard
              title="Razor Sharp"
              description="Focused tools for excellence"
              icon="⚡"
              accentColor="accent"
            />
          </div>
        </div>

        {/* Featured Tools Section */}
        <div className="w-full max-w-6xl px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <Overline className="text-indigo-500 mb-3 inline-block">
              Tools & Features
            </Overline>
            <Display className="text-slate-900 mb-4">
              Precision Tools for Project Excellence
            </Display>
            <Body size="lg" className="text-slate-600 max-w-2xl mx-auto">
              Navigate complex projects with our comprehensive suite designed to
              streamline workflows and drive results. All coming in Q1 2026.
            </Body>
          </div>

          {/* Tools Grid - Reorganized with better visual variety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {/* Primary Tools (Red accent) */}
            <FeaturedCard
              title={tools[0].title}
              description={tools[0].description}
              icon={tools[0].icon}
              accentColor="primary"
              className="h-full hover-lift transition-all duration-300"
            />
            <FeaturedCard
              title={tools[1].title}
              description={tools[1].description}
              icon={tools[1].icon}
              accentColor="primary"
              className="h-full hover-lift transition-all duration-300"
            />

            {/* Secondary Tools (Indigo accent) */}
            <FeaturedCard
              title={tools[2].title}
              description={tools[2].description}
              icon={tools[2].icon}
              accentColor="primary"
              className="h-full hover-lift transition-all duration-300 md:col-span-2"
            />

            {/* Accent Tools Row */}
            <FeaturedCard
              title={tools[3].title}
              description={tools[3].description}
              icon={tools[3].icon}
              accentColor="accent"
              className="h-full hover-lift transition-all duration-300"
            />
            <FeaturedCard
              title={tools[4].title}
              description={tools[4].description}
              icon={tools[4].icon}
              accentColor="accent"
              className="h-full hover-lift transition-all duration-300"
            />
          </div>

          {/* Additional Tools Section */}
          <div className="mb-16">
            <Headline className="mb-8 text-slate-900">And More Coming</Headline>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.slice(5).map((tool, index) => (
                <ComingSoonCard
                  key={index}
                  title={tool.title.split(" ")[0]}
                  subtitle={tool.title
                    .replace(tool.title.split(" ")[0], "")
                    .trim()}
                  description={tool.description.substring(0, 60) + "..."}
                  icon={tool.icon}
                  eta="Q1 2026"
                />
              ))}
            </div>
          </div>

          {/* Enhanced Call-to-Action Section */}
          <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-50 border border-indigo-100 rounded-2xl p-12 text-center hover-lift transition-all duration-300 shadow-sm hover:shadow-md">
            <Headline className="text-slate-900 mb-3">
              Ready to Transform Your Projects?
            </Headline>
            <Body size="lg" className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Join our waitlist for early access to Spearyx and be among the
              first to experience precision project management.
            </Body>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center gap-2 hover-lift">
                Get Early Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-3 bg-white border-2 border-indigo-500 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2">
                Learn More
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Secondary Info */}
            <Body size="sm" className="text-slate-500 mt-6">
              No spam, no obligations. We'll keep you updated on our progress.
            </Body>
          </div>
        </div>
      </section>

      {/* Footer with Enhanced Design */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <Hero className="text-gradient-primary mb-2" as="h3">
                Spearyx
              </Hero>
              <Body size="sm" className="text-slate-600">
                Precision project management tools
              </Body>
            </div>

            {/* Links */}
            <div>
              <Headline className="text-slate-900 mb-3" as="h4">
                Product
              </Headline>
              <ul className="space-y-2">
                <li>
                  <Body
                    size="sm"
                    className="text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    Features
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    Roadmap
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    Pricing
                  </Body>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <Headline className="text-slate-900 mb-3" as="h4">
                Company
              </Headline>
              <ul className="space-y-2">
                <li>
                  <Body
                    size="sm"
                    className="text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    About
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    Blog
                  </Body>
                </li>
                <li>
                  <Body
                    size="sm"
                    className="text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    Contact
                  </Body>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-200 pt-8 text-center">
            <Body size="sm" className="text-slate-600">
              © 2025 Spearyx. All rights reserved. Precision project
              management, coming your way.
            </Body>
          </div>
        </div>
      </footer>
    </div>
  );
}
