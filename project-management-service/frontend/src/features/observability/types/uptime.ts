export interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
}

export interface NodeUptimeMetric {
  nodeName: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  bootTimestamp: number;
  bootTimeReadable: string;
}

export interface UptimeMetrics {
  systemUptimeSeconds: number;
  systemUptimeFormatted: string;
  nodeUptimes: NodeUptimeMetric[];
  averageUptimeSeconds: number;
  averageUptimeFormatted: string;
  uptimeHistory: TimeSeriesDataPoint[];
}

export interface SystemUptimeResponse {
  uptimeSeconds: number;
  uptime: string;
}
