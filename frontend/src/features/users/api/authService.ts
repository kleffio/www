import { client } from "@shared/lib/client";
import type { UserSettings } from "@features/users/types/User";

interface CreateSessionRequest {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
}

interface SessionResponse {
  session_id: string;
}

export async function createSession(
  accessToken: string,
  refreshToken?: string,
  idToken?: string,
  expiresIn: number = 3600
): Promise<SessionResponse> {
  const payload: CreateSessionRequest = {
    access_token: accessToken,
    refresh_token: refreshToken,
    id_token: idToken,
    expires_in: expiresIn
  };

  const res = await client.post<SessionResponse>("/api/v1/auth/callback", payload, {
    withCredentials: true
  });

  return res.data;
}

export async function getCurrentUserWithSession(): Promise<UserSettings> {
  const res = await client.get<UserSettings>("/api/v1/users/me/session", {
    withCredentials: true
  });
  return res.data;
}

interface LogoutResponse {
  status: string;
  logout_url?: string;
}

export async function logoutSession(): Promise<LogoutResponse> {
  const res = await client.post<LogoutResponse>(
    "/api/v1/auth/logout",
    {},
    {
      withCredentials: true
    }
  );
  
  return res.data;
}