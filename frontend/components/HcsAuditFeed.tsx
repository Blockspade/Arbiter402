import React from "react";
import { HcsAuditRecordUI } from "../lib/mockData";
import { FileCheck, ExternalLink, Hash, Radio } from "lucide-react";

interface Props {
  records: HcsAuditRecordUI[];
}

export const HcsAuditFeed: React.FC<Props> = ({ records }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold font-mono tracking-tight text-slate-950">Hedera Consensus Service (HCS) Audit Proofs</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Topic 0.0.10520952
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Immutable nanosecond consensus proofs anchored to Hedera Consensus Service
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 font-mono text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <FileCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-950">Job #{record.jobId} Dispute Proof</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 flex items-center font-medium">
                      <Hash className="h-3 w-3 mr-0.5 text-slate-400" />
                      Seq #{record.sequenceNumber}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                    Consensus Time: <span className="text-slate-700 tabular-nums font-medium">{record.consensusTimestamp}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="text-rose-700 font-semibold tabular-nums">
                      Seller: ${record.sellerValue}
                    </span>
                    <span className="text-slate-400">vs</span>
                    <span className="text-emerald-700 font-semibold tabular-nums">
                      Oracle: ${record.groundTruthValue}
                    </span>
                    <span className="text-slate-600 tabular-nums">
                      (+{record.deltaPercent}% Error)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 self-end md:self-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  REFUND &amp; SLASHED
                </span>
                <a
                  href={record.hashscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 transition text-[11px] shadow-sm"
                >
                  <span>HashScan</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
