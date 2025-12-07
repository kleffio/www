import { client } from "@shared/lib/client";
import type { Container } from "@features/projects/types/Container";

export default async function fetchProjectContainers(projectId: string): Promise<Container[]> {
  try {
    const res = await client.get<Container[]>(`/api/v1/projects/${projectId}/containers`);
    return res.data ?? [];
  } catch (error: any) {
    // If the API returns 404 (no containers found), treat it as successful empty response
    if (error.response?.status === 404) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}
