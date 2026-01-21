export interface ContainerMetrics {
  containerName: string;
  cpuUsageCores: number;
  memoryUsageBytes: number;
  networkRxBytes: number;
  networkTxBytes: number;
  diskReadBytes: number;
  diskWriteBytes: number;
  uptimeSeconds: number;
}

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  totalContainers: number;
  runningContainers: number;
  totalCpuCores: number;
  totalMemoryGb: number;
  totalNetworkRxGb: number;
  totalNetworkTxGb: number;
  totalDiskReadGb: number;
  totalDiskWriteGb: number;
  estimatedMonthlyCost: number;
  containers: ContainerMetrics[];
  timestamp: number;
}
