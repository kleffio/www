export interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
}

export interface ClusterOverview {
  totalNodes: number;
  runningNodes: number;
  totalPods: number;
  totalNamespaces: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
}

export interface MetricCard {
  title: string;
  value: string;
  rawValue: number;
  changePercent: string;
  changeLabel: string;
  status: "excellent" | "good" | "warning" | "critical";
  sparkline: TimeSeriesDataPoint[];
}

export interface ResourceUtilization {
  currentValue: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  history: TimeSeriesDataPoint[];
}

export interface NodeMetric {
  name: string;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  podCount: number;
  status: string;
}

export interface NamespaceMetric {
  name: string;
  podCount: number;
  cpuUsage: number;
  memoryUsage: number;
}
