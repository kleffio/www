import { client } from "@shared/lib/client";
import type { Container } from "@features/projects/types/Container";
import type { ContainerRequest } from "@features/projects/types/ContainerRequest";

export default async function createContainer(payload: ContainerRequest): Promise<Container> {
  const res = await client.post<Container>("/api/v1/containers", payload);
  return res.data;
}
