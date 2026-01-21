import { client } from "@shared/lib/client";
import type { Project } from "@features/projects/types/Project";

export default async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await client.get<Project[]>("/api/v1/projects");
    return res.data ?? [];
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    // If the API returns 404 (no projects found), treat it as successful empty response
    if (err.response?.status === 404) {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
}
