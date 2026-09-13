import React from "react";
import { Play, RotateCcw, ArrowRight, ArrowLeft, Check, ShieldAlert, Cpu, Database, Award, Lock } from "lucide-react";

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
    narration: "Proof is anchored to Hedera HCS (Topic 0.0.4851920), 100% refunded to buyer, and rogue seller is slashed by -50 points!",
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
    <div className="rounded-2xl border border-indigo-900/60 bg-gray-950/90 p-5 shadow-2xl backdrop-blur-md">
      {/* Top Bar: Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Interactive Pitch Walkthrough Controller
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Demo Mode
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Step through the exact multi-sponsor adjudication flow for hackathon presentation
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
            <button
              onClick={() => onToggleMode("honest")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                mode === "honest"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Honest Flow
            </button>
            <button
              onClick={() => onToggleMode("rogue")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                mode === "rogue"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Rogue Flow (Slash)
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 text-xs transition"
            title="Reset to Step 1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 5-Step Progress Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 my-4">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => onSetStep(s.step)}
              className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500"
                  : isCompleted
                  ? "bg-gray-900/80 border-gray-800 text-gray-300 hover:border-gray-700"
                  : "bg-gray-950/60 border-gray-900 text-gray-500 hover:border-gray-800"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isActive
                    ? "bg-indigo-500 text-white"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : s.step}
              </div>
              <div className="overflow-hidden">
                <div className={`text-xs font-bold truncate ${isActive ? "text-white" : ""}`}>
                  {s.title}
                </div>
                <div className="text-[10px] text-gray-500 truncate">{s.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Presenter Narration Teleprompter */}
      <div className="rounded-xl bg-gray-900/80 border border-gray-800/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center space-x-2.5">
          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
            Presenter Guide
          </span>
          <p className="text-gray-300 font-medium">
            <strong className="text-white">Say: </strong>
            &ldquo;{currentStepData.narration}&rdquo;
          </p>
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onSetStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 text-xs transition"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => onSetStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30"
          >
            <span>Next Step</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
