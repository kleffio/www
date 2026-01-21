import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import type { UserSettings, UserSettingsState } from "@features/users/types/User";
import { setAccessToken } from "@shared/lib/client";
import { Me } from "@features/users/api/me";

const UserSettingsContext = createContext<UserSettingsState | undefined>(undefined);

function UserSettingsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { isLoading: authLoading, isAuthenticated, user } = auth;

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setAccessToken(null);
      setSettings(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const token = user?.access_token;
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
  }, [authLoading, isAuthenticated, user?.access_token]);

  useEffect(() => {
    const handleTokenExpiring = () => {
      if (import.meta.env.DEV) console.log("🔄 Token expiring, attempting silent refresh...");
    };

    const handleTokenExpired = () => {
      if (import.meta.env.DEV) console.log("⚠️ Token expired");
    };

    const handleSilentRenewError = (error: Error) => {
      console.error("❌ Silent renew error:", error);
    };

    const events = auth.events;
    events.addAccessTokenExpiring(handleTokenExpiring);
    events.addAccessTokenExpired(handleTokenExpired);
    events.addSilentRenewError(handleSilentRenewError);

    return () => {
      events.removeAccessTokenExpiring(handleTokenExpiring);
      events.removeAccessTokenExpired(handleTokenExpired);
      events.removeSilentRenewError(handleSilentRenewError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export { UserSettingsContext, UserSettingsProvider };
