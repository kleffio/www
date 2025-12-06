import { useAuth } from "react-oidc-context";

type AuthProfile = {
  name?: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  [key: string]: unknown;
};

export function useIdentity() {
  const auth = useAuth();
  const rawProfile = auth.user?.profile as AuthProfile | undefined;

  const email = rawProfile?.email ?? "";
  const name =
    rawProfile?.name ??
    rawProfile?.preferred_username ??
    ([rawProfile?.given_name, rawProfile?.family_name].filter(Boolean).join(" ") ||
      email ||
      "Unknown User");

  const initial = (name[0] ?? email[0] ?? "K").toUpperCase();

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    email,
    name,
    initial,
    picture: rawProfile?.picture ?? null,
    auth
  };
}
