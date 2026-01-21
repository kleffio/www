import type { ProjectUsageMetrics } from '../types/projectUsageMetrics.types.ts';
import { client } from '@shared/lib/client';

export async function getProjectUsage(projectID: string): Promise<ProjectUsageMetrics> {
  const response = await client.get<ProjectUsageMetrics>(`/api/v1/systems/projects/${projectID}/totalusage`);
  return response.data;
}
