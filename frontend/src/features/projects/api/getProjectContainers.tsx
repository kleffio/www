import { client } from "@shared/lib/client";
import type { Container } from "@features/projects/types/Container";

export default async function fetchProjectContainers(projectId: string): Promise<Container[]> {
  try {
    const res = await client.get<any[]>(`/api/v1/containers/${projectId}`);
    // Transform the API response to match the Container type
    const containers: Container[] = (res.data ?? []).map(item => ({
      containerId: item.containerID || item.containerId,
      name: item.name,
      status: item.status || 'Unknown',
      image: item.image,
      ports: item.ports || (item.port ? [item.port.toString()] : []),
      createdAt: item.createdAt,
      repoUrl: item.repoUrl || '',
      branch: item.branch || 'main',
      envVariables: item.envVariables || {},
    }));
    return containers;
  } catch (error: any) {
    // If the API returns 404 (no containers found), treat it as successful empty response
    if (error.response?.status === 404) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}