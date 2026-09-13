"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { DisputeTerminal } from "../components/DisputeTerminal";
import { ReputationBoard } from "../components/ReputationBoard";
import { EscrowStream } from "../components/EscrowStream";
import { HcsAuditFeed } from "../components/HcsAuditFeed";
import { INITIAL_JOBS, INITIAL_AGENTS, INITIAL_HCS_LOGS } from "../lib/mockData";
import { Zap, ShieldCheck, Database, Bot } from "lucide-react";

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState<"honest" | "rogue">("rogue");
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [hcsLogs, setHcsLogs] = useState(INITIAL_HCS_LOGS);

  const handleHonestRun = () => {
    setActiveScenario("honest");
    setJobs([
      {
        id: 3,
        buyer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        amountHbar: 0.5,
        metric: "Uniswap v3 VWAP",
        status: "RESOLVED",
        time: "Just now",
        txHash: "0xca23974a91283...",
      },
      ...jobs,
    ]);
  };

  const handleRogueRun = () => {
    setActiveScenario("rogue");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Protocol Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Resolution Finality
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">0.84s</div>
            <p className="text-[11px] text-gray-500 mt-1">Hedera EVM sub-second execution</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center space-x-2 text-indigo-400 mb-1">
              <Database className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Ground-Truth Oracle
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">100%</div>
            <p className="text-[11px] text-gray-500 mt-1">The Graph decentralized subgraphs</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center space-x-2 text-orange-400 mb-1">
              <Bot className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Agent Reputation
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">ERC-8004</div>
            <p className="text-[11px] text-gray-500 mt-1">Autonomous onchain slashing</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-wider text-gray-400">
                Total Gas Cost
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">~$0.007</div>
            <p className="text-[11px] text-gray-500 mt-1">Viable for high-frequency micropayments</p>
          </div>
        </div>

        {/* Adjudication Terminal (Hero) */}
        <DisputeTerminal
          onHonestRun={handleHonestRun}
          onRogueRun={handleRogueRun}
          activeScenario={activeScenario}
        />

        {/* Reputation & Slashes */}
        <ReputationBoard agents={agents} isRogue={activeScenario === "rogue"} />

        {/* Live Escrows & HCS Proofs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EscrowStream jobs={jobs} />
          <HcsAuditFeed records={hcsLogs} />
        </div>
      </main>

      <footer className="border-t border-gray-900 bg-gray-950 py-6 text-center text-xs text-gray-500">
        <p>
          Arbiter402 • Built for ETHOnline 2026 • Targeting Hedera ($6,000), The Graph ($5,000), and Bazantic ($1,000)
        </p>
      </footer>
    </div>
  );
}
