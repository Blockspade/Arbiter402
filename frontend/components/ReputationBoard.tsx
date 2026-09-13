import React from "react";
import { ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, Award } from "lucide-react";
import { AgentReputationUI } from "../lib/mockData";

interface Props {
  agents: AgentReputationUI[];
  isRogue: boolean;
  currentStep: number;
}

export const ReputationBoard: React.FC<Props> = ({ agents, isRogue, currentStep }) => {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">ERC-8004 Agent Reputation Registry</h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Onchain Trust Score
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Autonomous slashing locks fraudulent agents out of future machine commerce
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const isSeller = agent.name.includes("Seller");
          
          let displayScore = 100;
          let displaySlashes = 0;
          let badgeText = "BASELINE (100)";
          let isSlashed = false;
          let isBoosted = false;

          if (!isSeller) {
            displayScore = 100;
            displaySlashes = 0;
            badgeText = "TRUSTED (BUYER)";
          } else {
            if (currentStep < 5) {
              displayScore = 100;
              displaySlashes = 0;
              badgeText = "IN JOB #3 (100 PTS)";
            } else if (isRogue) {
              displayScore = 50;
              displaySlashes = 1;
              badgeText = "SLASHED (-50 PTS)";
              isSlashed = true;
            } else {
              displayScore = 105;
              displaySlashes = 0;
              badgeText = "TRUSTED (+5 PTS)";
              isBoosted = true;
            }
          }

          return (
            <div
              key={agent.address}
              className={`rounded-xl p-5 border transition-all duration-300 ${
                isSlashed
                  ? "bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500"
                  : isBoosted
                  ? "bg-emerald-950/20 border-emerald-800/80 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500"
                  : "bg-gray-950 border-gray-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isSlashed
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : isBoosted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    }`}
                  >
                    {isSlashed ? (
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                    ) : isBoosted ? (
                      <Award className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                    <p className="text-xs text-gray-400">{agent.role}</p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-all ${
                    isSlashed
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                      : isBoosted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  {badgeText}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-800/60 font-mono text-center">
                <div className="bg-gray-900/60 rounded-lg p-2">
                  <span className="text-[10px] text-gray-500 block uppercase">Trust Score</span>
                  <span
                    className={`text-lg font-bold flex items-center justify-center ${
                      isSlashed ? "text-rose-400" : isBoosted ? "text-emerald-400" : "text-gray-200"
                    }`}
                  >
                    {isSlashed && <TrendingDown className="h-4 w-4 mr-1 text-rose-400" />}
                    {isBoosted && <TrendingUp className="h-4 w-4 mr-1 text-emerald-400" />}
                    {displayScore} pts
                  </span>
                </div>

                <div className="bg-gray-900/60 rounded-lg p-2">
                  <span className="text-[10px] text-gray-500 block uppercase">Completed Jobs</span>
                  <span className="text-lg font-bold text-gray-200">
                    {currentStep >= 2 ? (currentStep === 5 ? (isRogue ? 2 : 3) : 2) : 2}
                  </span>
                </div>

                <div className="bg-gray-900/60 rounded-lg p-2">
                  <span className="text-[10px] text-gray-500 block uppercase">Slashes</span>
                  <span
                    className={`text-lg font-bold ${
                      displaySlashes > 0 ? "text-rose-400 font-extrabold" : "text-gray-400"
                    }`}
                  >
                    {displaySlashes}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-mono text-gray-500 truncate">
                Address: {agent.address}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
