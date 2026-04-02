import type { Metadata } from "next";
import { SignupForm } from "./_components/SignupForm";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | Veloce",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-xs text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold mb-3">Join Veloce</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create your account to start managing project briefs and collaborating with your team in the Veloce pipeline.
          </p>
          <div className="mt-8 space-y-3 text-left">
            {[
              "Instant AI-powered brief analysis",
              "Role-based access control",
              "Real-time pipeline updates",
              "Built-in analytics & reporting",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <p className="text-sm text-slate-300">{feat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Veloce</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 mt-1 text-sm">Join your team on the Veloce dashboard</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
