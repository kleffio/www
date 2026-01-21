import type { AuthContextProps } from "react-oidc-context";

export async function logoutEverywhere(auth: AuthContextProps) {
  const endSessionEndpoint =
    auth.settings?.metadata?.end_session_endpoint ??
    `${auth.settings?.authority?.replace(/\/+$/, "")}/end-session/`;

  const postLogout = `${window.location.origin}/`;

  try {
    await auth.removeUser();

    if (auth.signoutRedirect) {
      await auth.signoutRedirect({ post_logout_redirect_uri: postLogout });
      return;
    }

    if (endSessionEndpoint) {
      const url = new URL(endSessionEndpoint);
      if (auth.user?.id_token) url.searchParams.set("id_token_hint", auth.user.id_token);
      url.searchParams.set("post_logout_redirect_uri", postLogout);

      window.location.assign(url.toString());
      return;
    }
  } finally {
    window.location.assign("/");
  }
}
