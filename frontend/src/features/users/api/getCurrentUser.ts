import type { UserSettings } from "@features/users/types/User";

import { client } from "@shared/lib/client";

export default async function getCurrentUser(): Promise<UserSettings> {
  const response = await client.get<UserSettings>("/api/v1/users/me");
  return response.data;
}
