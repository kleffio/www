import { client } from "@shared/lib/client";
import type { Container } from "@features/projects/types/Container";
import type { ContainerRequest } from "@features/projects/types/ContainerRequest";

export default async function updateContainer(
  containerId: string,
  payload: ContainerRequest
): Promise<Container> {
  // Sends PUT to /api/v1/containers/{id}
  const res = await client.put<Container>(`/api/v1/containers/${containerId}`, payload);
  return res.data;
}
