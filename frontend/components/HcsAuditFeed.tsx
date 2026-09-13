import React from "react";
import { HcsAuditRecordUI } from "../lib/mockData";
import { FileCheck, ExternalLink, Hash } from "lucide-react";

interface Props {
  records: HcsAuditRecordUI[];
}

export const HcsAuditFeed: React.FC<Props> = ({ records }) => {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">Hedera Consensus Service (HCS) Audit Proofs</h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Immutable Topic Messages
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Every dispute ruling publishes cryptographic evidence directly to Hedera Consensus Service
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="rounded-xl border border-gray-800 bg-gray-950 p-4 font-mono text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-gray-700 transition"
          >
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white">Job #{record.jobId} Dispute Proof</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-indigo-400 flex items-center">
                    <Hash className="h-3 w-3 mr-0.5" />
                    Seq #{record.sequenceNumber}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Consensus Time: <span className="text-gray-200">{record.consensusTimestamp}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-rose-400 font-semibold">
                    Seller: ${record.sellerValue}
                  </span>
                  <span className="text-gray-500">vs</span>
                  <span className="text-emerald-400 font-semibold">
                    Oracle: ${record.groundTruthValue}
                  </span>
                  <span className="text-gray-400">
                    (+{record.deltaPercent}% Error)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end md:self-center">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                REFUND &amp; SLASHED
              </span>
              <a
                href={record.hashscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition"
              >
                <span>HashScan</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
