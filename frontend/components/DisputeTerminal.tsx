import React from "react";
import { AlertTriangle, CheckCircle2, Zap, Clock, ShieldCheck, Database } from "lucide-react";

interface Props {
  onHonestRun: () => void;
  onRogueRun: () => void;
  activeScenario: "honest" | "rogue";
  currentStep: number;
}

export const DisputeTerminal: React.FC<Props> = ({
  onHonestRun,
  onRogueRun,
  activeScenario,
  currentStep,
}) => {
  const isRogue = activeScenario === "rogue";

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 shadow-2xl backdrop-blur-sm">
      {/* Terminal Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">Dispute Adjudication Terminal</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Bazantic MCP Recipe Engine
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Automated mathematical referee evaluating deliverables against The Graph deterministic ground truth
          </p>
        </div>

        {/* Current State Badge */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono text-gray-300 flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Phase: Step {currentStep}/5</span>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 my-6 items-center">
        {/* Left: Seller Agent Output */}
        <div
          className={`md:col-span-5 rounded-xl p-5 border transition-all duration-300 ${
            currentStep < 2
              ? "bg-gray-950/40 border-gray-800 text-gray-500"
              : isRogue
              ? "bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/30"
              : "bg-emerald-950/20 border-emerald-800/60"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              Seller Agent B (Worker Node)
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                currentStep < 2
                  ? "bg-gray-800 text-gray-400"
                  : isRogue
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {currentStep < 2
                ? "Computing..."
                : isRogue
                ? "Hallucinated Output"
                : "Verified Deliverable"}
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white mb-2">
            {currentStep < 2
              ? "0.5 HBAR Locked"
              : isRogue
              ? "$3,842.10"
              : "$3,214.50"}
          </div>

          <div className="space-y-1.5 text-xs text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-gray-200">
                {currentStep === 1 && "Escrow Funded (Awaiting delivery)"}
                {currentStep === 2 && "Submitted (Pending inspection)"}
                {currentStep === 3 && "Dispute Raised by Buyer"}
                {currentStep >= 4 && (isRogue ? "Proven Defective" : "Proven Honest")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Commitment Hash:</span>
              <span className="text-indigo-400 truncate max-w-[160px]">
                {currentStep >= 2
                  ? isRogue
                    ? "0xc03ca3762599..."
                    : "0x5fa553720ceb..."
                  : "Pending commit..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Escrow Stake:</span>
              <span className="text-gray-200">0.5 HBAR locked</span>
            </div>
          </div>
        </div>

        {/* Center: Delta Indicator */}
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
              currentStep < 4
                ? "bg-gray-900 border-gray-800 text-gray-500"
                : isRogue
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            }`}
          >
            {currentStep < 4 ? "VS" : isRogue ? "≠" : "="}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 font-mono">
            {currentStep < 4 ? "Pending" : isRogue ? "+19.52%" : "0.00%"}
          </span>
        </div>

        {/* Right: The Graph Ground-Truth Oracle */}
        <div
          className={`md:col-span-5 rounded-xl p-5 border transition-all duration-300 ${
            currentStep < 4
              ? "bg-gray-950/40 border-gray-800 text-gray-500"
              : "border-indigo-800/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              The Graph Decentralized Oracle
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                currentStep < 4
                  ? "bg-gray-800 text-gray-400"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {currentStep < 4 ? "Standby" : "Ground-Truth Benchmark"}
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white mb-2">
            {currentStep < 4 ? "Ready to Index" : "$3,214.50"}
          </div>

          <div className="space-y-1.5 text-xs text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>Data Source:</span>
              <span className="text-gray-200">
                {currentStep < 4 ? "Uniswap v3 Subgraph" : "Uniswap v3 Subgraph (Live)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Block Window:</span>
              <span className="text-gray-200">20,000,000 ─ 20,000,100</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Swaps:</span>
              <span className="text-gray-200">
                {currentStep < 4 ? "Awaiting dispute trigger" : "42 onchain events"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision & Settlement Banner */}
      <div
        className={`rounded-xl p-4 border flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300 ${
          currentStep < 3
            ? "bg-gray-950 border-gray-800 text-gray-400"
            : currentStep === 3
            ? "bg-amber-950/40 border-amber-800/80 text-amber-200"
            : isRogue
            ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
            : "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          {currentStep < 3 ? (
            <ShieldCheck className="h-6 w-6 text-gray-500 flex-shrink-0" />
          ) : currentStep === 3 ? (
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
          ) : isRogue ? (
            <AlertTriangle className="h-6 w-6 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm text-white">
              {currentStep === 1 && "STEP 1: CONDITIONAL ESCROW LOCKED ON HEDERA EVM (0.5 HBAR)"}
              {currentStep === 2 && "STEP 2: DELIVERABLE COMMITMENT SUBMITTED BY SELLER AGENT B"}
              {currentStep === 3 && "STEP 3: BUYER FLAGGED ANOMALOUS DELIVERABLE (+19.5% DIVERGENCE)"}
              {currentStep === 4 && "STEP 4: THE GRAPH ORACLE PROVES 19.52% ERROR (EXCEEDS 1.00% TOLERANCE)"}
              {currentStep === 5 &&
                (isRogue
                  ? "STEP 5: BUYER 100% REFUNDED (0.5 HBAR) • ROGUE SELLER SLASHED -50 PTS ON ERC-8004"
                  : "STEP 5: SELLER PAID 100% (0.5 HBAR) • ERC-8004 REPUTATION BOOSTED (+5 PTS)")}
            </div>
            <p className="text-xs text-gray-300">
              {currentStep === 1 && "Funds safely held in ArbiterEscrow.sol. Challenge window countdown initiated."}
              {currentStep === 2 && "Deliverable hash locked onchain. Buyer agent inspecting payload accuracy."}
              {currentStep === 3 && "DisputeRaised event emitted on Hedera EVM. Arbiter Referee Service invoked."}
              {currentStep === 4 && "Deterministic onchain indexing proves seller calculation was hallucinated."}
              {currentStep === 5 &&
                (isRogue
                  ? "Cryptographic proof anchored to Hedera HCS (Topic 0.0.10520952). Settlement finalized onchain in 0.84s."
                  : "Delivery matched ground truth perfectly. Payment released to seller with positive reputation feedback.")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-black/40 border border-gray-700 text-gray-300">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>0.84s Finality</span>
          </div>
          <span
            className={`font-bold px-2.5 py-1 rounded ${
              currentStep < 5
                ? "bg-gray-800 text-gray-300"
                : isRogue
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-black"
            }`}
          >
            {currentStep < 5
              ? `IN PROGRESS (${currentStep}/5)`
              : isRogue
              ? "BUYER REFUNDED (100%)"
              : "SELLER PAID (100%)"}
          </span>
        </div>
      </div>
    </div>
  );
};
