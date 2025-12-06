import { Sidebar } from "@shared/ui/Sidebar";
import { AlertCircle, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MetricCard } from "../../components/MetricCard";
import { NamespacesTable } from "../../components/NamespacesTable";
import { NodesList } from "../../components/NodesList";
import { ResourceChart } from "../../components/ResourceChart";
import { metricsApi } from "../../services/metricsApi";
import type {
  DatabaseMetrics,
  MetricCard as MetricCardType,
  NamespaceMetric,
  NodeMetric,
  ResourceUtilization
} from "../../types/metrics";

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes >= 1099511627776) {
    return `${(bytes / 1099511627776).toFixed(1)} TB`;
  } else if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  } else if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export const MetricsDashboard: React.FC = () => {
  const [requestsMetric, setRequestsMetric] = useState<MetricCardType | null>(null);
  const [podsMetric, setPodsMetric] = useState<MetricCardType | null>(null);
  const [nodesMetric, setNodesMetric] = useState<MetricCardType | null>(null);
  const [tenantsMetric, setTenantsMetric] = useState<MetricCardType | null>(null);
  const [cpuData, setCpuData] = useState<ResourceUtilization | null>(null);
  const [memoryData, setMemoryData] = useState<ResourceUtilization | null>(null);
  const [databaseIoData, setDatabaseIoData] = useState<DatabaseMetrics | null>(null);
  const [nodes, setNodes] = useState<NodeMetric[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [duration, setDuration] = useState<string>("1h");

  const fetchData = async () => {
    try {
      setError(null);
      const [
        requestsRes,
        podsRes,
        nodesMetricRes,
        tenantsRes,
        cpuRes,
        memoryRes,
        databaseIoRes,
        nodesRes,
        namespacesRes
      ] = await Promise.all([
        metricsApi.getRequestsMetric("1h"),
        metricsApi.getPodsMetric("1h"),
        metricsApi.getNodesMetric("1h"),
        metricsApi.getTenantsMetric("1h"),
        metricsApi.getCpuUtilization(duration),
        metricsApi.getMemoryUtilization(duration),
        metricsApi.getDatabaseIoMetrics(duration),
        metricsApi.getNodes(),
        metricsApi.getNamespaces()
      ]);

      setRequestsMetric(requestsRes.data);
      setPodsMetric(podsRes.data);
      setNodesMetric(nodesMetricRes.data);
      setTenantsMetric(tenantsRes.data);
      setCpuData(cpuRes.data);
      setMemoryData(memoryRes.data);
      setDatabaseIoData(databaseIoRes.data);
      setNodes(nodesRes.data);
      setNamespaces(namespacesRes.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError("Failed to fetch metrics. Check if backend is running on port 8080.");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="bg-kleff-bg relative isolate flex h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
        <div className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-white/10 via-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black via-transparent" />

      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="app-container py-8">
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-neutral-50">Metrics Overview</h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Monitor your Kubernetes cluster metrics
                </p>
              </div>

              {/* Time Range Selector - Prominent Position */}
              <div className="flex flex-col items-end gap-2">
                <label className="text-sm font-medium text-neutral-300">Time Range</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="rounded-lg border-2 border-white/20 bg-white/5 px-4 py-2.5 text-base font-medium text-neutral-50 shadow-lg shadow-black/20 transition-all hover:border-white/30 hover:bg-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none [&>option]:bg-neutral-900 [&>option]:text-neutral-50"
                >
                  <option value="1m">Last 1 minute</option>
                  <option value="5m">Last 5 minutes</option>
                  <option value="15m">Last 15 minutes</option>
                  <option value="1h">Last 1 hour</option>
                  <option value="6h">Last 6 hours</option>
                  <option value="24h">Last 24 hours</option>
                </select>
                <span className="text-xs text-neutral-500">Affects all time-series data</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500 bg-red-500/10 px-5 py-4 text-red-500">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {requestsMetric && <MetricCard metric={requestsMetric} loading={loading} />}
            {podsMetric && <MetricCard metric={podsMetric} loading={loading} />}
            {nodesMetric && <MetricCard metric={nodesMetric} loading={loading} />}
            {tenantsMetric && (
              <MetricCard
                metric={{ ...tenantsMetric, changeLabel: "Hardcoded value" }}
                loading={loading}
              />
            )}
          </div>

          {/* Database Metrics Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-50">
              Database Usage Metrics
              {databaseIoData && databaseIoData.source && (
                <span className="ml-2 text-sm font-normal text-neutral-400">
                  ({databaseIoData.source})
                </span>
              )}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {databaseIoData && (
                <>
                  <MetricCard
                    metric={{
                      title: "DB Disk Read",
                      value: formatBytes(databaseIoData.diskReadBytesPerSec) + "/s",
                      rawValue: databaseIoData.diskReadBytesPerSec,
                      changePercent: `${databaseIoData.diskReadOpsPerSec.toFixed(0)} ops/s`,
                      changeLabel: "Storage operations",
                      status: "good",
                      sparkline: databaseIoData.diskReadHistory || []
                    }}
                    loading={loading}
                  />
                  <MetricCard
                    metric={{
                      title: "DB Disk Write",
                      value: formatBytes(databaseIoData.diskWriteBytesPerSec) + "/s",
                      rawValue: databaseIoData.diskWriteBytesPerSec,
                      changePercent: `${databaseIoData.diskWriteOpsPerSec.toFixed(0)} ops/s`,
                      changeLabel: "Storage operations",
                      status: "good",
                      sparkline: databaseIoData.diskWriteHistory || []
                    }}
                    loading={loading}
                  />
                  <MetricCard
                    metric={{
                      title: "DB Network In",
                      value: formatBytes(databaseIoData.networkReceiveBytesPerSec) + "/s",
                      rawValue: databaseIoData.networkReceiveBytesPerSec,
                      changePercent: `${databaseIoData.networkReceiveOpsPerSec.toFixed(0)} pkt/s`,
                      changeLabel: "Connection traffic",
                      status: "good",
                      sparkline: databaseIoData.networkReceiveHistory || []
                    }}
                    loading={loading}
                  />
                  <MetricCard
                    metric={{
                      title: "DB Network Out",
                      value: formatBytes(databaseIoData.networkTransmitBytesPerSec) + "/s",
                      rawValue: databaseIoData.networkTransmitBytesPerSec,
                      changePercent: `${databaseIoData.networkTransmitOpsPerSec.toFixed(0)} pkt/s`,
                      changeLabel: "Query responses",
                      status: "good",
                      sparkline: databaseIoData.networkTransmitHistory || []
                    }}
                    loading={loading}
                  />
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Performance Section - Full Width */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-neutral-50">Performance</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {cpuData && (
                  <ResourceChart
                    title="CPU Utilization"
                    data={cpuData}
                    color="#fb923c"
                    loading={loading}
                  />
                )}
                {memoryData && (
                  <ResourceChart
                    title="Memory Utilization"
                    data={memoryData}
                    color="#10b981"
                    loading={loading}
                  />
                )}
              </div>
            </div>

            {/* Infrastructure and Node Metrics - Side by Side */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Infrastructure</h2>
                <div className="h-96 overflow-y-auto rounded-lg border border-white/10 bg-black/20">
                  <NamespacesTable namespaces={namespaces} loading={loading} />
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Node Metrics</h2>
                <div className="h-96 overflow-y-auto rounded-lg border border-white/10 bg-black/20">
                  <NodesList nodes={nodes} loading={loading} />
                </div>
              </div>
            </div>

            {/* Actions - Below */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-neutral-50">Actions</h2>
              <div className="space-y-2">
                <button
                  className="w-full justify-start rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-neutral-200 hover:border-white/40 hover:bg-white/10"
                  onClick={() => fetchData()}
                >
                  <RefreshCw className="mr-2 inline-block h-4 w-4" /> Refresh Metrics
                </button>
              </div>
            </div>
          </div>
          {/* (removed bottom duplicates - Nodes now live in right column) */}

          <div className="mt-6 text-sm text-neutral-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
