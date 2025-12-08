import type { UserSettings } from "@features/users/types/User";
import { client } from "@shared/lib/client";

export interface UpdateUserProfileRequest {
  name: string | null;
  email: string | null;
  phone: string | null;
  theme: string;
  timezone: string | null;
  marketingEmails: boolean;
}

export async function updateUserProfile(data: UpdateUserProfileRequest): Promise<UserSettings> {
  const response = await client.put<UserSettings>("/api/v1/users/me", data);
  return response.data;
}
