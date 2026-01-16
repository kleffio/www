import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import type { UserSettings, UserSettingsState } from "@features/users/types/User";
import { setAccessToken } from "@shared/lib/client";
import { Me } from "@features/users/api/me";
import {
  createSession,
  getCurrentUserWithSession,
  logoutSession
} from "@features/users/api/authService";

const UserSettingsContext = createContext<UserSettingsState | undefined>(undefined);

const USE_BFF = import.meta.env.VITE_USE_BFF === "true";

function UserSettingsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { isLoading: authLoading, isAuthenticated, user } = auth;

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionCreated, setSessionCreated] = useState(false);

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
      setSessionCreated(false);
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

    try {
      setIsLoading(true);
      setError(null);

      if (USE_BFF && !sessionCreated) {
        console.log("🔐 Creating BFF session...");

        try {
          await createSession(token, user?.refresh_token, user?.id_token, user?.expires_in);

          setSessionCreated(true);
          console.log("✅ BFF session created");
        } catch (sessionError) {
          console.warn(
            "⚠️ Failed to create BFF session, falling back to token auth:",
            sessionError
          );
        }
      }

      if (USE_BFF && sessionCreated) {
        try {
          const data = await getCurrentUserWithSession();
          setSettings(data);
          console.log("✅ Loaded user via BFF session");
          return;
        } catch (sessionError) {
          console.warn("⚠️ Session auth failed, trying token auth:", sessionError);
        }
      }

      setAccessToken(token);
      const data = await Me(token);
      setSettings(data);
      console.log("✅ Loaded user via token auth");
    } catch (e) {
      console.error("Failed to load user settings", e);
      setError(e as Error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, user, sessionCreated]);

  const handleLogout = useCallback(async () => {
    if (USE_BFF && sessionCreated) {
      try {
        await logoutSession();
        console.log("✅ BFF session cleared");
      } catch (e) {
        console.warn("Failed to clear BFF session:", e);
      }
    }
    
    setSessionCreated(false);
    setSettings(null);
    setAccessToken(null);
    setError(null);
  }, [sessionCreated]);

  useEffect(() => {
    const handleTokenExpiring = () => {
      if (import.meta.env.DEV) console.log("🔄 Token expiring, attempting silent refresh...");
    };

    const handleTokenExpired = () => {
      if (import.meta.env.DEV) console.log("⚠️ Token expired");
      handleLogout();
    };

    const handleSilentRenewError = (error: Error) => {
      console.error("❌ Silent renew error:", error);
    };

    const handleUserUnloaded = () => {
      if (import.meta.env.DEV) console.log("👤 User unloaded from OIDC");
      handleLogout();
    };

    const events = auth.events;
    events.addAccessTokenExpiring(handleTokenExpiring);
    events.addAccessTokenExpired(handleTokenExpired);
    events.addSilentRenewError(handleSilentRenewError);
    events.addUserUnloaded(handleUserUnloaded);

    return () => {
      events.removeAccessTokenExpiring(handleTokenExpiring);
      events.removeAccessTokenExpired(handleTokenExpired);
      events.removeSilentRenewError(handleSilentRenewError);
      events.removeUserUnloaded(handleUserUnloaded);
    };
  }, [auth.events, handleLogout]);

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