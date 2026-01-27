import { client } from "@shared/lib/client";
import type {
  ClusterOverview,
  MetricCard,
  NamespaceMetric,
  NodeMetric,
  ResourceUtilization,
  DatabaseMetrics
} from "@features/observability/types/metrics";
import type { UptimeMetrics } from "@features/observability/types/uptime";

export interface AggregatedMetrics {
  overview: ClusterOverview;
  requestsMetric: MetricCard;
  podsMetric: MetricCard;
  nodesMetric: MetricCard;
  tenantsMetric: MetricCard;
  cpuUtilization: ResourceUtilization;
  memoryUtilization: ResourceUtilization;
  nodes: NodeMetric[];
  namespaces: NamespaceMetric[];
  databaseIOMetrics: DatabaseMetrics;
  uptimeMetrics: UptimeMetrics;
  systemUptime: number;
  systemUptimeFormatted: string;
}

export async function getAllMetrics(duration = "1h"): Promise<AggregatedMetrics> {
  const response = await client.get<AggregatedMetrics>("/api/v1/systems/metrics", {
    params: { duration }
  });
  return response.data;
}
