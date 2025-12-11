import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import type { UserSettings, UserSettingsState } from "@features/users/types/User";
import { setAccessToken } from "@shared/lib/client";
import { Me } from "@features/auth/api/me";

const UserSettingsContext = createContext<UserSettingsState | undefined>(undefined);

function UserSettingsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (auth.isLoading) {
      setIsLoading(true);
      return;
    }

    if (!auth.isAuthenticated) {
      setAccessToken(null);
      setSettings(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const token = auth.user?.access_token;
    if (!token) {
      console.warn("No access token found on auth.user");
      setAccessToken(null);
      setSettings(null);
      setIsLoading(false);
      return;
    }

    setAccessToken(token);

    try {
      setIsLoading(true);
      setError(null);

      const data = await Me(token);
      setSettings(data);
    } catch (e) {
      console.error("Failed to load user settings", e);
      setError(e as Error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user]);

  useEffect(() => {
    void load();
  }, [load]);

  const value: UserSettingsState = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      reload: load
    }),
    [settings, isLoading, error, load]
  );

  return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>;
}

export { UserSettingsContext, UserSettingsProvider, type UserSettingsState };
