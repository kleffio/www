import { client } from "@shared/lib/client";
import type { Project } from "@features/projects/types/Project";

export default async function fetchProjects(): Promise<Project[]> {
  const res = await client.get<Project[]>("/api/v1/projects");
  return res.data ?? [];
}
