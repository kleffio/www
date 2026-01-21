import type { NamespaceMetric } from "@features/observability/types/metrics";
import { client } from "@shared/lib/client";

export async function getNamespaces(): Promise<NamespaceMetric[]> {
  const response = await client.get<NamespaceMetric[]>("/api/v1/systems/namespaces");
  return response.data;
}
