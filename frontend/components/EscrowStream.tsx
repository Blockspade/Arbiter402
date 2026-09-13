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
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "REFUNDED":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "DISPUTED":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "DELIVERED":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "CREATED":
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Live Micro-Escrow Stream</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time Hedera EVM conditional transactions (ArbiterEscrow.sol)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800 uppercase tracking-wider">
              <th className="py-2 px-3">Job ID</th>
              <th className="py-2 px-3">Metric</th>
              <th className="py-2 px-3">Buyer</th>
              <th className="py-2 px-3">Seller</th>
              <th className="py-2 px-3">Deposit</th>
              <th className="py-2 px-3">State</th>
              <th className="py-2 px-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-800/30 transition">
                <td className="py-3 px-3 font-bold text-white">#{job.id}</td>
                <td className="py-3 px-3 text-gray-200">{job.metric}</td>
                <td className="py-3 px-3 text-indigo-400">{job.buyer.slice(0, 6)}...{job.buyer.slice(-4)}</td>
                <td className="py-3 px-3 text-indigo-400">{job.seller.slice(0, 6)}...{job.seller.slice(-4)}</td>
                <td className="py-3 px-3 font-bold text-emerald-400">{job.amountHbar} HBAR</td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusBadge(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-gray-500">{job.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
