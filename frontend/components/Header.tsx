import React from "react";
import { ShieldAlert, ExternalLink, Activity, Radio } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            {/* Solid Minimalist Black Emblem */}
            <div className="h-10 w-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-sm flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-950 font-mono">Arbiter402</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-slate-100 text-slate-800 border border-slate-300">
                  v1.0 Protocol
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Activity className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
                  <span>Sub-Second Finality</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Sub-Second Conditional Escrow &amp; Ground-Truth Adjudication for Autonomous Agents
              </p>
            </div>
          </div>

          {/* Network Badges & Verified HashScan Links */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Hedera Network Pill */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold">Hedera Testnet (296)</span>
            </div>

            {/* Escrow Contract Link */}
            <a
              href="https://hashscan.io/testnet/contract/0.0.10520281"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition text-xs font-mono text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm"
              title="Verified on Sourcify (Exact Match)"
            >
              <span>Escrow: 0.0.10520281</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>

            {/* ERC-8004 Registry Link */}
            <a
              href="https://hashscan.io/testnet/contract/0.0.10520278"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition text-xs font-mono text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm"
              title="Verified on Sourcify (Exact Match)"
            >
              <span>ERC-8004: 0.0.10520278</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>

            {/* HCS Topic Link */}
            <a
              href="https://hashscan.io/testnet/topic/0.0.10520952"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition text-xs font-mono text-slate-800 border border-slate-200 hover:border-slate-300 shadow-sm"
              title="Hedera Consensus Service Audit Trail"
            >
              <Radio className="h-3 w-3 text-amber-500 animate-pulse" />
              <span>HCS: 0.0.10520952</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
