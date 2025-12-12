import type { AuthContextProps } from "react-oidc-context";
import { client } from "@shared/lib/client";

export async function logoutEverywhere(auth: AuthContextProps) {
  const endSessionEndpoint =
    auth.settings?.metadata?.end_session_endpoint ??
    `${auth.settings?.authority?.replace(/\/+$/, "")}/end-session/`;

  try {
    if (endSessionEndpoint) {
      const url = new URL(endSessionEndpoint);

      if (auth.user?.id_token) {
        url.searchParams.set("id_token_hint", auth.user.id_token);
      }

      url.searchParams.set("post_logout_redirect_uri", `${window.location.origin}/`);

      await client
        .get(url.toString(), {
          withCredentials: true
        })
        .catch(() => {
          // Ignore errors — logout will still succeed locally
        });
    }
  } finally {
    await auth.removeUser();

    window.location.href = "/";
  }
}
