export default async function fetchProject(projectId: string): Promise<Project> {
  try {
    const res = await client.get<Project>(`/api/v1/billing/${projectId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
