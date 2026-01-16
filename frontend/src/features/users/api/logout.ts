import type { AuthContextProps } from "react-oidc-context";
import { logoutSession } from "./authService";

let isLoggingOut = false;

export async function logoutEverywhere(auth: AuthContextProps) {
  if (isLoggingOut) return;

  isLoggingOut = true;

  try {
    try {
      await logoutSession();
    } catch (e) {
      const err = e as { response?: { status?: number }; message?: string };

      if (err.response?.status === 404 || err.message?.includes("no session")) {
        console.log("No backend session to clear");
      }
    }

    await auth.removeUser();

    const idToken = auth.user?.id_token;
    if (idToken) {
      const origin = window.location.origin;
      const logoutUrl = `https://auth.kleff.io/application/o/kleff/end-session/?id_token_hint=${encodeURIComponent(
        idToken
      )}&post_logout_redirect_uri=${encodeURIComponent(origin)}`;

      window.location.href = logoutUrl;
    } else {
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Logout error:", error);

    await auth.removeUser();

    isLoggingOut = false;
    window.location.href = "/";
  }
}
