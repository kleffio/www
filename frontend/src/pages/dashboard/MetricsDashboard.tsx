import { Sidebar } from "@shared/ui/Sidebar";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { AlertCircle, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MetricCard } from "../../components/MetricCard";
import { NamespacesTable } from "../../components/NamespacesTable";
import { NodesList } from "../../components/NodesList";
import { ResourceChart } from "../../components/ResourceChart";
import { metricsApi } from "../../services/metricsApi";
import type {
  ClusterOverview,
  MetricCard as MetricCardType,
  NamespaceMetric,
  NodeMetric,
  ResourceUtilization
} from "../../types/metrics";
import "./MetricsDashboard.css";

export const MetricsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<ClusterOverview | null>(null);
  const [duration, setDuration] = useState<string>("1h");
  const [requestsMetric, setRequestsMetric] = useState<MetricCardType | null>(null);
  const [podsMetric, setPodsMetric] = useState<MetricCardType | null>(null);
  const [nodesMetric, setNodesMetric] = useState<MetricCardType | null>(null);
  const [cpuData, setCpuData] = useState<ResourceUtilization | null>(null);
  const [memoryData, setMemoryData] = useState<ResourceUtilization | null>(null);
  const [nodes, setNodes] = useState<NodeMetric[]>([]);
  const [namespaces, setNamespaces] = useState<NamespaceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setError(null);
      const [
        overviewRes,
        requestsRes,
        podsRes,
        nodesMetricRes,
        cpuRes,
        memoryRes,
        nodesRes,
        namespacesRes
      ] = await Promise.all([
        metricsApi.getOverview(),
        metricsApi.getRequestsMetric(duration),
        metricsApi.getPodsMetric(duration),
        metricsApi.getNodesMetric(duration),
        metricsApi.getCpuUtilization(duration),
        metricsApi.getMemoryUtilization(duration),
        metricsApi.getNodes(),
        metricsApi.getNamespaces()
      ]);

      setOverview(overviewRes.data);
      setRequestsMetric(requestsRes.data);
      setPodsMetric(podsRes.data);
      setNodesMetric(nodesMetricRes.data);
      setCpuData(cpuRes.data);
      setMemoryData(memoryRes.data);
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
                <p className="mt-1 text-sm text-neutral-400">Monitor your Kubernetes cluster metrics</p>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="duration-select" className="text-sm text-neutral-400">
                  Range
                </label>
                <select
                  id="duration-select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-neutral-200"
                >
                  <option value="1m">1m</option>
                  <option value="5m">5m</option>
                  <option value="15m">15m</option>
                  <option value="1h">1h</option>
                  <option value="6h">6h</option>
                  <option value="24h">24h</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-banner mb-4">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {requestsMetric && <MetricCard metric={requestsMetric} loading={loading} />}
            {podsMetric && <MetricCard metric={podsMetric} loading={loading} />}
            {nodesMetric && <MetricCard metric={nodesMetric} loading={loading} />}
            {overview && overview.cpuUsagePercent != null && (
              <MetricCard
                metric={{
                  title: "CPU Usage",
                  value: `${overview.cpuUsagePercent.toFixed(1)}%`,
                  rawValue: overview.cpuUsagePercent,
                  changePercent: "+0.0%",
                  changeLabel: "Cluster average",
                  status: overview.cpuUsagePercent > 80 ? "critical" : "good",
                  sparkline: []
                }}
                loading={loading}
              />
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Performance</h2>
                <div className="space-y-4">
                  <div className="charts-grid">
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
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Infrastructure</h2>
                <div className="space-y-4">
                  <div className="infrastructure-grid">
                    <NamespacesTable namespaces={namespaces} loading={loading} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
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

              {/* place node metrics in the right column space */}
              <SoftPanel>
                <h3 className="mb-2 text-sm font-semibold text-neutral-200">Node Metrics</h3>
                <NodesList nodes={nodes} loading={loading} />
              </SoftPanel>
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
