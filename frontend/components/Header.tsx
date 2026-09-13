import React from "react";
import { ShieldAlert, Cpu, Activity, ExternalLink } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-gray-800 bg-gray-950/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Arbiter402</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v1.0 ETHOnline
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Sub-Second Conditional Escrow & Ground-Truth Adjudication for Autonomous Agents
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Hedera Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Hedera Testnet (296)</span>
            </div>

            {/* The Graph Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/50 text-xs text-indigo-300">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              <span>The Graph Oracle</span>
            </div>

            {/* Bazantic MCP Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-800/40 text-xs text-orange-300">
              <Activity className="h-3.5 w-3.5 text-orange-400" />
              <span>Bazantic Recipe</span>
            </div>

            {/* HashScan Link */}
            <a
              href="https://hashscan.io/testnet/topic/0.0.4851920"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-xs text-gray-200 border border-gray-700"
            >
              <span>HCS: 0.0.4851920</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
