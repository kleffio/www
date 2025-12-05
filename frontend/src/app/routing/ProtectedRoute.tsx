import type { ReactElement } from "react";
import { useReducer } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";

type Props = { children: ReactElement };

export function ProtectedRoute({ children }: Props) {
  const auth = useAuth();
  const location = useLocation();

  const [hasEverBeenAuthenticated] = useReducer(
    (prev) => prev || auth.isAuthenticated,
    auth.isAuthenticated
  );

  if (auth.isLoading) {
    return (
      <div className="bg-kleff-bg flex min-h-screen items-center justify-center">
        <p className="text-sm text-neutral-400">Checking your session…</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    if (hasEverBeenAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return (
      <Navigate to="/auth/signin" replace state={{ from: location.pathname + location.search }} />
    );
  }

  return children;
}
