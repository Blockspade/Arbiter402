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
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      {/* Terminal Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-bold font-mono tracking-tight text-slate-950">Dispute Adjudication Terminal</h2>
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded bg-slate-100 text-slate-800 border border-slate-200">
              Bazantic MCP Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Automated mathematical referee evaluating deliverables against The Graph deterministic ground truth
          </p>
        </div>

        {/* Current State Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center space-x-2 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Phase: Step {currentStep}/5</span>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 my-6 items-stretch">
        
        {/* Left: Seller Agent Output */}
        <div
          className={`md:col-span-5 rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between ${
            currentStep < 2
              ? "bg-slate-50/70 border-slate-200 text-slate-500"
              : isRogue
              ? "bg-rose-50/60 border-rose-200 shadow-sm"
              : "bg-emerald-50/60 border-emerald-200 shadow-sm"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Seller Agent B (Worker Node)
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  currentStep < 2
                    ? "bg-white text-slate-500 border border-slate-200"
                    : isRogue
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {currentStep < 2
                  ? "Computing..."
                  : isRogue
                  ? "Hallucinated Output"
                  : "Verified Deliverable"}
              </span>
            </div>

            <div className="text-3xl font-bold font-mono text-slate-950 tracking-tight tabular-nums mb-3">
              {currentStep < 2
                ? "0.5 HBAR Locked"
                : isRogue
                ? "$3,842.10"
                : "$3,214.50"}
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 font-mono pt-3 border-t border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-slate-900 font-medium">
                {currentStep === 1 && "Escrow Funded (Awaiting delivery)"}
                {currentStep === 2 && "Submitted (Pending inspection)"}
                {currentStep === 3 && "Dispute Raised by Buyer"}
                {currentStep >= 4 && (isRogue ? "Proven Defective" : "Proven Honest")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Commitment Hash:</span>
              <span className="text-slate-700 truncate max-w-[160px]">
                {currentStep >= 2
                  ? isRogue
                    ? "0xc03ca3762599..."
                    : "0x5fa553720ceb..."
                  : "Pending commit..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Escrow Stake:</span>
              <span className="text-slate-900 font-medium">0.5 HBAR locked</span>
            </div>
          </div>
        </div>

        {/* Center: Live Mathematical Delta Meter */}
        <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2 px-1">
          <div
            className={`h-11 w-11 rounded-full flex items-center justify-center border font-mono font-bold text-xs transition-all duration-300 shadow-sm ${
              currentStep < 4
                ? "bg-slate-100 border-slate-200 text-slate-500"
                : isRogue
                ? "bg-rose-100 text-rose-700 border-rose-300 ring-2 ring-rose-200"
                : "bg-emerald-100 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200"
            }`}
          >
            {currentStep < 4 ? "VS" : isRogue ? "≠" : "="}
          </div>

          <div className="mt-2 text-center">
            <span
              className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                currentStep < 4
                  ? "text-slate-400"
                  : isRogue
                  ? "text-rose-700 bg-rose-50 border border-rose-200"
                  : "text-emerald-700 bg-emerald-50 border border-emerald-200"
              }`}
            >
              {currentStep < 4 ? "Pending" : isRogue ? "+19.52%" : "0.00%"}
            </span>
            <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
              {currentStep >= 4 ? (isRogue ? "Tol: 1.0%" : "Match") : "Delta"}
            </div>
          </div>
        </div>

        {/* Right: The Graph Ground-Truth Oracle */}
        <div
          className={`md:col-span-5 rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between ${
            currentStep < 4
              ? "bg-slate-50/70 border-slate-200 text-slate-500"
              : "bg-slate-50 border-slate-300 shadow-sm"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                The Graph Decentralized Oracle
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  currentStep < 4
                    ? "bg-white text-slate-500 border border-slate-200"
                    : "bg-slate-200/80 text-slate-800 border border-slate-300"
                }`}
              >
                {currentStep < 4 ? "Standby" : "Ground-Truth Benchmark"}
              </span>
            </div>

            <div className="text-3xl font-bold font-mono text-slate-950 tracking-tight tabular-nums mb-3">
              {currentStep < 4 ? "Ready to Index" : "$3,214.50"}
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 font-mono pt-3 border-t border-slate-200/80">
            <div className="flex justify-between">
              <span className="text-slate-500">Data Source:</span>
              <span className="text-slate-900 font-medium">
                {currentStep < 4 ? "Uniswap v3 Subgraph" : "Uniswap v3 Subgraph (Live)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Block Window:</span>
              <span className="text-slate-900 font-medium">20,000,000 ─ 20,000,100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Verified Swaps:</span>
              <span className="text-slate-900 font-medium">
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
            ? "bg-slate-50 border-slate-200 text-slate-700"
            : currentStep === 3
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : isRogue
            ? "bg-rose-50 border-rose-200 text-rose-950"
            : "bg-emerald-50 border-emerald-200 text-emerald-950"
        }`}
      >
        <div className="flex items-center space-x-3.5">
          {currentStep < 3 ? (
            <ShieldCheck className="h-5 w-5 text-slate-400 flex-shrink-0" />
          ) : currentStep === 3 ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          ) : isRogue ? (
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          )}
          <div>
            <div className="font-mono font-bold text-xs uppercase tracking-wide text-slate-950">
              {currentStep === 1 && "STEP 1: CONDITIONAL ESCROW LOCKED ON HEDERA EVM (0.5 HBAR)"}
              {currentStep === 2 && "STEP 2: DELIVERABLE COMMITMENT SUBMITTED BY SELLER AGENT B"}
              {currentStep === 3 && "STEP 3: BUYER FLAGGED ANOMALOUS DELIVERABLE (+19.5% DIVERGENCE)"}
              {currentStep === 4 && "STEP 4: THE GRAPH ORACLE PROVES 19.52% ERROR (EXCEEDS 1.00% TOLERANCE)"}
              {currentStep === 5 &&
                (isRogue
                  ? "STEP 5: BUYER 100% REFUNDED (0.5 HBAR) • ROGUE SELLER SLASHED -50 PTS ON ERC-8004"
                  : "STEP 5: SELLER PAID 100% (0.5 HBAR) • ERC-8004 REPUTATION BOOSTED (+5 PTS)")}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-normal">
              {currentStep === 1 && "Funds safely held in ArbiterEscrow.sol vault. Challenge window countdown initiated."}
              {currentStep === 2 && "Deliverable hash committed onchain. Buyer agent inspecting payload accuracy."}
              {currentStep === 3 && "DisputeRaised event emitted on Hedera EVM. Automated Referee Service invoked."}
              {currentStep === 4 && "Deterministic onchain indexing proves seller calculation was hallucinated."}
              {currentStep === 5 &&
                (isRogue
                  ? "Cryptographic proof anchored to Hedera HCS (Topic 0.0.10520952). Settlement finalized onchain in 0.84s."
                  : "Delivery matched ground truth perfectly. Payment released to seller with positive reputation feedback.")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono flex-shrink-0">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold">0.84s Finality</span>
          </div>
          <span
            className={`font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm ${
              currentStep < 5
                ? "bg-white text-slate-700 border border-slate-200"
                : isRogue
                ? "bg-rose-600 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {currentStep < 5
              ? `PROGRESS ${currentStep}/5`
              : isRogue
              ? "BUYER REFUNDED"
              : "SELLER PAID"}
          </span>
        </div>
      </div>
    </div>
  );
};
