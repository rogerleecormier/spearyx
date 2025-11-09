import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32">
        <div className="text-center max-w-2xl">
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-8xl font-bold text-slate-900 mb-4">
            <span className="text-primary-500">SPEARYX</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-slate-600 mb-8 font-light">
            Precision Project Management
          </p>

          {/* Description */}
          <p className="text-lg text-slate-700 mb-12 leading-relaxed">
            Cut through the noise with{" "}
            <span className="font-semibold text-slate-900">clarity</span>. Hit
            your <span className="font-semibold text-slate-900">targets</span>{" "}
            with
            <span className="font-semibold text-slate-900"> precision</span>.
            Manage projects with{" "}
            <span className="font-semibold text-slate-900">focus</span>.
          </p>

          {/* Coming Soon Badge */}
          <div className="inline-block">
            <div className="[background:linear-gradient(to_right,#ef4444,#dc2626)] text-white px-8 py-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide">
                  COMING SOON - TARGETTING 2026 Q1
                </span>
              </div>
              <p className="text-sm text-white opacity-90">
                The precision tools you've been targeting for
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-12 h-1 w-16 bg-gradient-to-r from-primary-500 to-slate-400 rounded mx-auto"></div>

          {/* Value Props - Using shadcn Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold text-primary-500 mb-2">
                  ✓
                </div>
                <CardTitle>Crystal Clear</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Clarity in every action, complete transparency in every
                  project
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold text-accent-500 mb-2">
                  🎯
                </div>
                <CardTitle>Precision-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Target your goals with laser-sharp accuracy and strategic
                  planning
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="text-3xl font-bold text-accent-500 mb-2">
                  ⚡
                </div>
                <CardTitle>Razor Sharp</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Cut through complexity with focused tools designed for
                  excellence
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-600 text-sm">
            © 2025 Spearyx. Precision project management, coming your way.
          </p>
        </div>
      </footer>
    </div>
  );
}
