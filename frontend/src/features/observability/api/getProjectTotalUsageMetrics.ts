import type { ProjectTotalUsageMetrics } from '../types/projectTotalUsageMetrics.types.ts';
import { client } from '@shared/lib/client';

export async function getProjectTotalUsageMetrics(projectID: string): Promise<ProjectTotalUsageMetrics> {
  const response = await client.get<ProjectTotalUsageMetrics>(`/api/v1/systems/projects/${projectID}/totalusage`);
  return response.data;
}