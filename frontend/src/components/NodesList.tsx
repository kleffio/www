import { Activity, Server } from "lucide-react";
import React from "react";
import type { NodeMetric } from "../types/metrics";

interface Props {
  nodes: NodeMetric[];
  loading?: boolean;
}

export const NodesList: React.FC<Props> = ({ nodes, loading }) => {
  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 p-6">
        <div className="h-[250px] w-full animate-pulse rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%]"></div>
      </div>
    );
  }

  const statusColors = {
    ready: "bg-emerald-500/15 text-emerald-500",
    notready: "bg-red-500/15 text-red-500",
    unknown: "bg-neutral-500/15 text-neutral-500"
  };

  const getStatusColor = (status: string) => {
    const key = status.toLowerCase() as keyof typeof statusColors;
    return statusColors[key] || statusColors.unknown;
  };

  // Check if nodes is an array
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6">
        <div className="mb-5 flex items-center gap-3 text-white">
          <Server size={20} />
          <h3 className="text-lg font-semibold">Node Metrics</h3>
        </div>
        <div className="py-5 text-center text-neutral-500">No nodes data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-6">
      <div className="mb-5 flex items-center gap-3 text-white">
        <Server size={20} />
        <h3 className="text-lg font-semibold">Node Metrics</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
        {nodes.map((node) => (
          <div
            key={node.name}
            className="hover:bg-neutral-750 rounded-lg border border-neutral-700 bg-neutral-800 p-4 transition-all duration-200 hover:border-neutral-600"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{node.name}</div>
              <div
                className={`rounded px-2 py-1 text-xs font-semibold uppercase ${getStatusColor(node.status)}`}
              >
                {node.status}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-400">CPU Usage</span>
                <div className="relative flex h-6 items-center rounded bg-black/50 px-2">
                  <div
                    className="absolute top-0 left-0 h-full rounded bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 transition-all duration-300"
                    style={{ width: `${node.cpuUsagePercent}%` }}
                  ></div>
                  <span className="relative z-10 text-xs font-semibold text-white">
                    {node.cpuUsagePercent?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-400">Memory</span>
                <div className="relative flex h-6 items-center rounded bg-black/50 px-2">
                  <div
                    className="absolute top-0 left-0 h-full rounded bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
                    style={{ width: `${node.memoryUsagePercent}%` }}
                  ></div>
                  <span className="relative z-10 text-xs font-semibold text-white">
                    {node.memoryUsagePercent?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-400">Pods</span>
                <div className="flex items-center gap-2 text-white">
                  <Activity size={14} />
                  <span className="text-sm font-semibold">{node.podCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
