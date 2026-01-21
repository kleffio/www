import { client } from "@shared/lib/client";

export interface LogEntry {
  timestamp: string;
  log: string;
  labels: Record<string, string>;
}

export interface ContainerLogsData {
  containerName: string;
  logs: LogEntry[];
  logCount: number;
  errorCount: number;
  warningCount: number;
  hasMore: boolean;
}

export interface ContainerLogsResponse {
  projectId: string;
  totalLogs: number;
  totalErrors: number;
  totalWarnings: number;
  containers: ContainerLogsData[];
  timestamp: number;
}

export async function getContainerLogs(
  projectId: string,
  containerName: string
): Promise<LogEntry[]> {
  const response = await client.post<ContainerLogsResponse>(
    "/api/v1/systems/logs/project-containers",
    {
      projectId,
      containerNames: [containerName],
      limit: 200,
      duration: "1h"
    }
  );

  // Extract just the logs from the first container
  const containerData = response.data.containers?.[0];
  return containerData?.logs || [];
}
