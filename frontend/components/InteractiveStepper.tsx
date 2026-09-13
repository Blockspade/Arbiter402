import React from "react";
import { Play, RotateCcw, ArrowRight, ArrowLeft, Check, ShieldAlert, Cpu, Database, Award, Lock, Terminal } from "lucide-react";

interface Props {
  currentStep: number;
  onSetStep: (step: number) => void;
  onReset: () => void;
  mode: "honest" | "rogue";
  onToggleMode: (mode: "honest" | "rogue") => void;
}

export const STEPS = [
  {
    step: 1,
    title: "1. Lock Escrow",
    subtitle: "x402 & Hedera EVM",
    icon: Lock,
    narration: "Buyer Agent A negotiates via HTTP 402 and locks 0.5 HBAR into ArbiterEscrow on Hedera EVM.",
  },
  {
    step: 2,
    title: "2. Deliver Work",
    subtitle: "Worker Commit Hash",
    icon: Cpu,
    narration: "Seller Agent B calculates VWAP and commits its cryptographic deliverable hash onchain before deadline.",
  },
  {
    step: 3,
    title: "3. Raise Dispute",
    subtitle: "Anomaly Detected",
    icon: ShieldAlert,
    narration: "Buyer Agent A detects a +19.5% divergence and raises an onchain dispute within the challenge window.",
  },
  {
    step: 4,
    title: "4. The Graph Oracle",
    subtitle: "Ground-Truth Subgraphs",
    icon: Database,
    narration: "Referee pulls raw onchain swaps from The Graph, proving true VWAP is $3,214.50 (deviation exceeds 1% tolerance).",
  },
  {
    step: 5,
    title: "5. HCS Audit & Settle",
    subtitle: "Hedera HCS & ERC-8004",
    icon: Award,
    narration: "Proof is anchored to Hedera HCS (Topic 0.0.10520952), 100% refunded to buyer, and rogue seller is slashed by -50 points!",
  },
];

export const InteractiveStepper: React.FC<Props> = ({
  currentStep,
  onSetStep,
  onReset,
  mode,
  onToggleMode,
}) => {
  const currentStepData = STEPS[currentStep - 1] || STEPS[0];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      {/* Top Bar: Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-bold font-mono tracking-wider uppercase text-slate-900">
              Protocol Workflow Simulator
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-100 text-slate-700 border border-slate-200">
              Interactive Execution
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Step through the autonomous micro-escrow, deliverable hashing, and dispute resolution pipeline
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            <button
              onClick={() => onToggleMode("honest")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === "honest"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Honest Flow
            </button>
            <button
              onClick={() => onToggleMode("rogue")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                mode === "rogue"
                  ? "bg-rose-600 text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rogue Flow (Slash)
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-mono transition shadow-sm"
            title="Reset to Step 1"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 5-Step Progress Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 my-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => onSetStep(s.step)}
              className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                isActive
                  ? "bg-slate-950 border-slate-950 text-white shadow-md ring-2 ring-slate-900"
                  : isCompleted
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                  : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 shadow-sm ${
                  isActive
                    ? "bg-white text-slate-950"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.step}
              </div>
              <div className="overflow-hidden">
                <div className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-slate-800"}`}>
                  {s.title}
                </div>
                <div className={`text-[10px] font-mono truncate ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Protocol State Telemetry Feed */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center space-x-2.5">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white text-slate-800 font-mono text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border border-slate-200 shadow-sm">
            <Terminal className="h-3 w-3 text-slate-600" />
            <span>State Telemetry</span>
          </span>
          <p className="text-slate-800 font-normal">
            &ldquo;{currentStepData.narration}&rdquo;
          </p>
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onSetStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-mono transition border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => onSetStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs font-mono transition shadow-sm"
          >
            <span>Next Step</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
