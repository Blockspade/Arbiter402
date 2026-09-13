import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ArrowRight, Zap, ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  onHonestRun: () => void;
  onRogueRun: () => void;
  activeScenario: "honest" | "rogue";
}

export const DisputeTerminal: React.FC<Props> = ({ onHonestRun, onRogueRun, activeScenario }) => {
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

        {/* Scenario Toggle Buttons */}
        <div className="flex items-center space-x-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button
            onClick={onHonestRun}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !isRogue
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Honest Flow (Match)
          </button>
          <button
            onClick={onRogueRun}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isRogue
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Rogue Flow (Slash)
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 my-6 items-center">
        {/* Left: Seller Agent Output */}
        <div
          className={`md:col-span-5 rounded-xl p-5 border transition-all duration-300 ${
            isRogue
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
                isRogue
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {isRogue ? "Hallucinated Output" : "Verified Deliverable"}
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white mb-2">
            {isRogue ? "$3,842.10" : "$3,214.50"}
          </div>

          <div className="space-y-1.5 text-xs text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>Metric:</span>
              <span className="text-gray-200">Uniswap v3 VWAP</span>
            </div>
            <div className="flex justify-between">
              <span>Commitment Hash:</span>
              <span className="text-indigo-400 truncate max-w-[160px]">
                {isRogue ? "0xee7b0258b9fa41..." : "0x7494c200440532..."}
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
            className={`h-10 w-10 rounded-full flex items-center justify-center border font-bold text-xs ${
              isRogue
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            }`}
          >
            {isRogue ? "≠" : "="}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 font-mono">
            {isRogue ? "+19.52%" : "0.00%"}
          </span>
        </div>

        {/* Right: The Graph Ground-Truth Oracle */}
        <div className="md:col-span-5 rounded-xl p-5 border border-indigo-800/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
              The Graph Decentralized Oracle
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Ground-Truth Benchmark
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white mb-2">$3,214.50</div>

          <div className="space-y-1.5 text-xs text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>Data Source:</span>
              <span className="text-gray-200">Uniswap v3 Subgraph</span>
            </div>
            <div className="flex justify-between">
              <span>Block Window:</span>
              <span className="text-gray-200">20,000,000 ─ 20,000,100</span>
            </div>
            <div className="flex justify-between">
              <span>Verified Swaps:</span>
              <span className="text-gray-200">42 onchain events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision & Settlement Banner */}
      <div
        className={`rounded-xl p-4 border flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
          isRogue
            ? "bg-rose-950/40 border-rose-800/80 text-rose-200"
            : "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          {isRogue ? (
            <AlertTriangle className="h-6 w-6 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm text-white">
              {isRogue
                ? "DISCREPANCY DETECTED: +19.52% DEVIATION (TOLERANCE: 1.00%)"
                : "DELIVERABLE VERIFIED: 0.00% DEVIATION WITHIN TOLERANCE"}
            </div>
            <p className="text-xs text-gray-300">
              {isRogue
                ? "Rogue payload mathematically proven defective. 100% Escrow refunded to Buyer Agent A; Seller Agent B slashed."
                : "Payload perfectly matches onchain ground truth. Payment released to Seller Agent B; reputation boosted."}
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
              isRogue ? "bg-rose-600 text-white" : "bg-emerald-600 text-black"
            }`}
          >
            {isRogue ? "BUYER REFUNDED (100%)" : "SELLER PAID (100%)"}
          </span>
        </div>
      </div>
    </div>
  );
};
