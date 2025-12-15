import type { ProjectMetrics } from '../types/projectMetrics.types';
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