import type { UserSettings } from "@features/users/types/User";
import { client } from "@shared/lib/client";

export interface UpdateUserProfileRequest {
  handle?: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export async function updateUserProfile(data: UpdateUserProfileRequest): Promise<UserSettings> {
  const response = await client.patch<UserSettings>("/api/v1/users/me/profile", data);
  return response.data;
}
