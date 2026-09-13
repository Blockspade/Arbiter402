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
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <h3 className="text-base font-bold font-mono tracking-tight text-slate-950">ERC-8004 Agent Reputation Registry</h3>
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Onchain Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Autonomous onchain slashing locks fraudulent agents out of future autonomous escrow pools
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
              className={`rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isSlashed
                  ? "bg-rose-50/70 border-rose-300 shadow-sm"
                  : isBoosted
                  ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                  : "bg-slate-50/70 border-slate-200"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                        isSlashed
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : isBoosted
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isSlashed ? (
                        <ShieldAlert className="h-5 w-5 text-rose-600" />
                      ) : isBoosted ? (
                        <Award className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-slate-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{agent.name}</h4>
                      <p className="text-xs text-slate-500 font-normal">{agent.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all ${
                      isSlashed
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : isBoosted
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-white text-slate-700 border border-slate-200 shadow-sm"
                    }`}
                  >
                    {badgeText}
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isSlashed ? "w-1/2 bg-rose-600" : isBoosted ? "w-full bg-emerald-500" : "w-full bg-emerald-600"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200/80 font-mono text-center">
                <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Trust Score</span>
                  <span
                    className={`text-base font-bold tabular-nums flex items-center justify-center ${
                      isSlashed ? "text-rose-700" : isBoosted ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {isSlashed && <TrendingDown className="h-3.5 w-3.5 mr-1 text-rose-600" />}
                    {isBoosted && <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-600" />}
                    {displayScore} pts
                  </span>
                </div>

                <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Jobs Settled</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {currentStep >= 2 ? (currentStep === 5 ? (isRogue ? 2 : 3) : 2) : 2}
                  </span>
                </div>

                <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Slashes</span>
                  <span
                    className={`text-base font-bold tabular-nums ${
                      displaySlashes > 0 ? "text-rose-700 font-extrabold" : "text-slate-600"
                    }`}
                  >
                    {displaySlashes}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 text-[11px] font-mono text-slate-500 truncate">
                Address: <span className="text-slate-700 font-medium">{agent.address}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
