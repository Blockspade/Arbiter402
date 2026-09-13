import React from "react";
import { ShieldCheck, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";
import { AgentReputationUI } from "../lib/mockData";

interface Props {
  agents: AgentReputationUI[];
  isRogue: boolean;
}

export const ReputationBoard: React.FC<Props> = ({ agents, isRogue }) => {
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
          const displayScore = isSeller ? (isRogue ? 55 : 105) : 100;
          const displaySlashes = isSeller ? (isRogue ? 1 : 0) : 0;
          const isSlashed = isSeller && isRogue;

          return (
            <div
              key={agent.address}
              className={`rounded-xl p-5 border transition-all duration-300 ${
                isSlashed
                  ? "bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20"
                  : "bg-gray-950 border-gray-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isSlashed
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {isSlashed ? (
                      <ShieldAlert className="h-5 w-5 text-rose-400" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                    <p className="text-xs text-gray-400">{agent.role}</p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                    isSlashed
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {isSlashed ? "SLASHED (-50)" : "TRUSTED (+5)"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-800/60 font-mono text-center">
                <div className="bg-gray-900/60 rounded-lg p-2">
                  <span className="text-[10px] text-gray-500 block uppercase">Trust Score</span>
                  <span
                    className={`text-lg font-bold flex items-center justify-center ${
                      isSlashed ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {isSlashed ? (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    )}
                    {displayScore}
                  </span>
                </div>

                <div className="bg-gray-900/60 rounded-lg p-2">
                  <span className="text-[10px] text-gray-500 block uppercase">Completed Jobs</span>
                  <span className="text-lg font-bold text-gray-200">{agent.totalJobs}</span>
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
