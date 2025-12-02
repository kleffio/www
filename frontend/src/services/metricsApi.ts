import axios from "axios";
import type {
  ClusterOverview,
  DatabaseMetrics,
  MetricCard,
  NamespaceMetric,
  NodeMetric,
  ResourceUtilization
} from "../types/metrics";

const api = axios.create({
  baseURL: "http://localhost:8080/api/metrics",
  timeout: 10000
});

export const metricsApi = {
  getOverview: () => api.get<ClusterOverview>("/overview"),

  getRequestsMetric: (duration = "1h") =>
    api.get<MetricCard>("/requests-metric", { params: { duration } }),

  getPodsMetric: (duration = "1h") => api.get<MetricCard>("/pods-metric", { params: { duration } }),

  getNodesMetric: (duration = "1h") =>
    api.get<MetricCard>("/nodes-metric", { params: { duration } }),

  getCpuUtilization: (duration = "1h") =>
    api.get<ResourceUtilization>("/cpu", { params: { duration } }),

  getMemoryUtilization: (duration = "1h") =>
    api.get<ResourceUtilization>("/memory", { params: { duration } }),

  getNodes: () => api.get<NodeMetric[]>("/nodes"),

  getNamespaces: () => api.get<NamespaceMetric[]>("/namespaces"),

  getDatabaseIoMetrics: (duration = "1h") =>
    api.get<DatabaseMetrics>("/database-io", { params: { duration } }),

  getTenantsMetric: (duration = "1h") =>
    api.get<MetricCard>("/tenants-metric", { params: { duration } })
};
