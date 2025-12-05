import { client } from "@shared/lib/client";
import type { Project } from "@features/projects/types/Project";
import type { ProjectRequestModel } from "@features/projects/models/ProjectRequest";

export default async function createProject(payload: ProjectRequestModel): Promise<Project> {
  const res = await client.post<Project>("/api/v1/projects", payload);
  return res.data;
}
