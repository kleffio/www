import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import { KleffDot } from "@shared/ui/KleffDot";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";
import { ROUTES } from "@app/routes/routes";
import { createSession } from "@features/users/api/authService";

const USE_BFF = import.meta.env.VITE_USE_BFF === "true";

export function AuthPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const from = location.state?.from ?? ROUTES.DASHBOARD;
  const attemptedRef = useRef(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const isCallback = useMemo(() => {
    const qs = new URLSearchParams(window.location.search);
    return qs.has("code") || qs.has("id_token") || qs.has("error") || qs.has("state");
  }, []);

  useEffect(() => {
    const intentionalLogout = sessionStorage.getItem("intentional_logout");
    
    if (intentionalLogout && auth.isAuthenticated && !isCallback) {
      console.log("Detected auto-login after intentional logout, forcing re-authentication...");
      
      sessionStorage.removeItem("intentional_logout");
      
      auth.removeUser().then(() => {
        console.log("Cleared auto-login, user must sign in again");
      }).catch((e) => {
        console.error("Failed to remove auto-logged user:", e);
      });
      
      return;
    }
  }, [auth.isAuthenticated, isCallback, auth]);

  useEffect(() => {
    if (auth.isLoading || isCreatingSession) return;
    if (!isCallback) return;
    if (!auth.isAuthenticated) {
      console.log("⏳ Waiting for authentication to complete...");
      return;
    }

    if (!auth.user?.access_token) {
      console.warn("Authenticated but no access token, retrying...");
      return;
    }

    if (USE_BFF) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreatingSession(true);

      createSession(
        auth.user.access_token,
        auth.user.refresh_token,
        auth.user.id_token,
        auth.user.expires_in
      )
        .then(() => {
          console.log("✅ Session created, navigating to:", from);
          navigate(from, { replace: true });
        })
        .catch((err) => {
          console.warn("Failed to create session, continuing anyway:", err);
          navigate(from, { replace: true });
        })
        .finally(() => {
          setIsCreatingSession(false);
        });
    } else {
      console.log("✅ Authentication complete, navigating to:", from);
      navigate(from, { replace: true });
    }
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.user,
    isCallback,
    from,
    navigate,
    isCreatingSession
  ]);

  useEffect(() => {
    if (auth.isLoading || isCreatingSession) return;
    if (isCallback) return;
    
    if (auth.isAuthenticated) {
      console.log("Already authenticated, navigating to:", from);
      navigate(from, { replace: true });
      return;
    }
    
    if (attemptedRef.current) return;

    console.log("Initiating sign-in redirect...");
    attemptedRef.current = true;

    auth.signinRedirect({ state: { from } }).catch((err) => {
      console.error("[AuthPage] signinRedirect failed:", err);
      attemptedRef.current = false;
    });
  }, [auth.isLoading, auth.isAuthenticated, auth, isCallback, from, navigate, isCreatingSession]);

  const handleContinue = () => {
    console.log("🔄 Manual sign-in retry...");
    attemptedRef.current = false;
    auth.signinRedirect({ state: { from } }).catch((err) => {
      console.error("[AuthPage] signinRedirect failed:", err);
      navigate(ROUTES.HOME, { replace: true });
    });
  };

  const title = isCreatingSession
    ? "Setting up your session..."
    : isCallback
      ? "Finishing sign-in…"
      : "Redirecting to Kleff Auth…";

  const subtitle = isCreatingSession
    ? "We're creating a secure session for you. This usually only takes a moment."
    : isCallback
      ? "We're completing your login and securing your session. This usually only takes a moment."
      : "We're securely sending you to the Kleff sign-in page. This usually only takes a moment.";

  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4"
      data-testid="auth-callback"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl shadow-black/70">
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="bg-kleff-gold/10 flex h-12 w-12 items-center justify-center rounded-2xl">
            <KleffDot size={28} variant="full" />
          </div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <p className="text-center text-xs text-neutral-400">{subtitle}</p>
        </div>

        <div className="flex justify-center py-6">
          <Spinner size={56} label={title} />
        </div>

        <div className="mt-5 flex flex-col gap-2 text-center">
          <p className="text-[11px] text-neutral-500">
            {USE_BFF && isCreatingSession
              ? "Creating secure session..."
              : "If nothing happens after a few seconds, you can restart the sign-in manually."}
          </p>
          {!isCreatingSession && (
            <Button
              variant="outline"
              className="hover:border-kleff-gold/60 border-white/15 bg-transparent text-xs text-neutral-200 hover:text-white"
              onClick={handleContinue}
              disabled={auth.isLoading}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}