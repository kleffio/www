import { client } from "@shared/lib/client";
import type { Container } from "@features/projects/types/Container";

interface UpdateEnvVariablesPayload {
  envVariables: Record<string, string>;
}

export default async function updateContainerEnvVariables(
  containerId: string,
  envVariables: Record<string, string>
): Promise<Container> {
  const payload: UpdateEnvVariablesPayload = { envVariables };
  const res = await client.patch<Container>(`/api/v1/containers/${containerId}/env`, payload);
  return res.data;
}
