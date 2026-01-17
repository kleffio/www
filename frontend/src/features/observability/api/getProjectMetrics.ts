import type { ProjectMetrics } from '../types/projectMetrics.types';
import type { ProjectUsage } from '../types/projectUsage.types';
import { client } from '@shared/lib/client';

export async function getProjectMetrics(
  projectId: string,
  containerNames: string[]
): Promise<ProjectMetrics> {
  const response = await client.post<ProjectMetrics>('/api/v1/systems/project-metrics', {
    projectId,
    containerNames,
  });

  return response.data;
}

export async function getProjectUsage(projectId: string): Promise<ProjectUsage> {
  const response = await client.get<ProjectUsage>(`/api/v1/systems/projects/${projectId}/usage`);

  return response.data;
}
