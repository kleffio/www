import { client } from "@shared/lib/client";

export async function getUsernameById(userID: string): Promise<string> {
  const response = await client.get<{ username: string }>(`/api/v1/users/${userID}`);
  return response.data.username;
}