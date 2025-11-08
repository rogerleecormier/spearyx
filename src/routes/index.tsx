import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <img
            src="/images/spearyx-logo.svg"
            alt="Spearyx Logo"
            className="h-10 w-auto"
          />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32">
        <div className="text-center max-w-2xl">


          {/* Main Heading */}
          <h1 className="text-5xl sm:text-8xl font-bold text-gray-900 mb-4">
            <span className="text-red-600">SPEARYX</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 font-light">
            Precision Project Management
          </p>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            Cut through the noise with{" "}
            <span className="font-semibold text-gray-900">clarity</span>. Hit
            your <span className="font-semibold text-gray-900">targets</span>{" "}
            with
            <span className="font-semibold text-gray-900"> precision</span>.
            Manage projects with{" "}
            <span className="font-semibold text-gray-900">focus</span>.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-block">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">
                  COMING SOON - TARGETTING 2026 Q1
                </span>
              </div>
              <p className="text-sm text-red-100">
                The precision tools you've been targeting for
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-12 h-1 w-16 bg-gradient-to-r from-red-600 to-gray-400 rounded mx-auto"></div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-red-600 mb-2">✓</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Crystal Clear
              </h3>
              <p className="text-sm text-gray-600">
                Clarity in every action, complete transparency in every project
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-red-600 mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Precision-Focused
              </h3>
              <p className="text-sm text-gray-600">
                Target your goals with laser-sharp accuracy and strategic
                planning
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-3xl font-bold text-red-600 mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Razor Sharp</h3>
              <p className="text-sm text-gray-600">
                Cut through complexity with focused tools designed for
                excellence
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 Spearyx. Precision project management, coming your way.
          </p>
        </div>
      </footer>
    </div>
  );
}
