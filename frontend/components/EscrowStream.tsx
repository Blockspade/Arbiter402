import React from "react";
import { EscrowJobUI } from "../lib/mockData";
import { Clock, ExternalLink } from "lucide-react";

interface Props {
  jobs: EscrowJobUI[];
}

export const EscrowStream: React.FC<Props> = ({ jobs }) => {
  const getStatusBadge = (status: EscrowJobUI["status"]) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REFUNDED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "DISPUTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "DELIVERED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CREATED":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold font-mono tracking-tight text-slate-950">Live Micro-Escrow Stream</h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Hedera EVM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Real-time conditional state stream from ArbiterEscrow.sol (0.0.10520281)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] bg-slate-50/50">
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Buyer</th>
                <th className="py-2.5 px-3">Seller</th>
                <th className="py-2.5 px-3">Deposit</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-bold text-slate-950 tabular-nums">#{job.id}</td>
                  <td className="py-3 px-3 text-slate-700">{job.metric}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{job.buyer.slice(0, 6)}...{job.buyer.slice(-4)}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{job.seller.slice(0, 6)}...{job.seller.slice(-4)}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 tabular-nums">{job.amountHbar} HBAR</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border font-mono ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 text-[11px]">{job.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
