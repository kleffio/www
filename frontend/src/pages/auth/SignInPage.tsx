import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@app/routes/routes";
import { KleffDot } from "@shared/ui/KleffDot";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";

export function SignInPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const from = location.state?.from ?? "/dashboard";
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    if (auth.isLoading) return;

    attemptedRef.current = true;

    if (auth.isAuthenticated) {
      navigate(from, { replace: true });
      return;
    }

    auth.signinRedirect({ state: { from } }).catch((err) => {
      console.error("Sign-in redirect failed:", err);
      navigate(ROUTES.HOME, { replace: true });
    });
  }, [auth.isLoading, auth.isAuthenticated, auth, from, navigate]);

  const handleTryAgain = () => {
    auth.signinRedirect({ state: { from } }).catch((err) => {
      console.error("Sign-in redirect failed:", err);
      navigate(ROUTES.HOME, { replace: true });
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl shadow-black/70">
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="bg-kleff-gold/10 flex h-12 w-12 items-center justify-center rounded-2xl">
            <KleffDot size={28} variant="full" />
          </div>
          <h1 className="text-lg font-semibold text-white">Signing you in…</h1>
          <p className="text-center text-xs text-neutral-400">
            Redirecting you to Kleff Auth to complete sign-in.
          </p>
        </div>

        <div className="flex justify-center py-6">
          <Spinner size={56} label="Signing you in…" />
        </div>

        <div className="mt-5 flex flex-col gap-2 text-center">
          <p className="text-[11px] text-neutral-500">
            If nothing happens after a few seconds, restart the sign-in.
          </p>
          <Button
            variant="outline"
            className="hover:border-kleff-gold/60 border-white/15 bg-transparent text-xs text-neutral-200 hover:text-white"
            onClick={handleTryAgain}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
