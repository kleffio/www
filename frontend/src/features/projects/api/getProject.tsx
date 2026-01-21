import { client } from "@shared/lib/client";
import type { Project } from "@features/projects/types/Project";

export default async function fetchProject(projectId: string): Promise<Project> {
  const res = await client.get<Project>(`/api/v1/projects/${projectId}`);
  return res.data;
}
