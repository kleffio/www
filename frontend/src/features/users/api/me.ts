import { client } from "@shared/lib/client";

export async function Me(accessToken: string) {
  const response = await client.get("/api/v1/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    },
    withCredentials: true
  });

  return response.data;
}
