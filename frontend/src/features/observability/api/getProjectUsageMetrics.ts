import type { ProjectUsageMetrics } from '../types/projectUsageMetrics.types';
import { client } from '@shared/lib/client';

export async function getProjectUsageMetrics(projectID: string): Promise<ProjectUsageMetrics> {
  const response = await client.get<ProjectUsageMetrics>(`/api/v1/systems/projects/${projectID}/usage`);
  return response.data;
}
