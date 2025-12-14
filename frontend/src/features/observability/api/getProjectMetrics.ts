import axios from 'axios';
import type { ProjectMetrics } from '../types/projectMetrics.types';

export async function getProjectMetrics(
  projectId: string,
  containerNames: string[]
): Promise<ProjectMetrics> {
  const response = await axios.post<ProjectMetrics>(
    '/api/v1/systems/project-metrics',
    {
      projectId,
      containerNames,
    }
  );
  
  return response.data;
}