// ProtectedRoute.tsx
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Spinner } from "@shared/ui/Spinner";
import { ROUTES } from "@app/routes/routes";

type Props = { children: ReactElement };

export function ProtectedRoute({ children }: Props) {
  const auth = useAuth();
  const location = useLocation();

  const attemptedRef = useRef(false);
  const [attempting, setAttempting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (auth.isLoading) return;
    if (auth.isAuthenticated) {
      // Reset flags when authenticated
      attemptedRef.current = false;
      setShouldRedirect(false);
      return;
    }
    if (attemptedRef.current) return;

    attemptedRef.current = true;

    void (async () => {
      setAttempting(true);
      try {
        await auth.signinSilent();
        // Success - user is now authenticated
        if (import.meta.env.DEV) console.debug("Silent refresh succeeded");
      } catch (err) {
        if (import.meta.env.DEV) console.debug("Silent refresh failed", err);

        // Check if there's a user object at all (means we had a session)
        // If no user object, we need to redirect to sign in
        if (!auth.user) {
          setShouldRedirect(true);
        }
      } finally {
        setAttempting(false);
      }
    })();
  }, [auth.isLoading, auth.isAuthenticated, auth]);

  if (auth.isLoading || attempting) {
    return (
      <div className="bg-kleff-bg flex min-h-screen items-center justify-center">
        <Spinner size={56} label="Checking your session…" />
      </div>
    );
  }

  if (!auth.isAuthenticated && shouldRedirect) {
    return (
      <Navigate
        to={ROUTES.AUTH_SIGNIN}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (!auth.isAuthenticated) {
    // Still attempting or waiting
    return (
      <div className="bg-kleff-bg flex min-h-screen items-center justify-center">
        <Spinner size={56} label="Authenticating…" />
      </div>
    );
  }

  return children;
}
