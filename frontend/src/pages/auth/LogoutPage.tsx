import { useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import { Spinner } from "@shared/ui/Spinner";
import { logoutEverywhere } from "@features/users/api/logout";

export function LogoutPage() {
  const auth = useAuth();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    console.log("🚪 Logout page mounted, starting logout...");
    
    logoutEverywhere(auth).catch((error) => {
      console.error("Logout error:", error);

      window.location.href = "/";
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      data-testid="logout-page"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/70 p-6 shadow-2xl shadow-black/70">
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="bg-red-500/10 flex h-12 w-12 items-center justify-center rounded-2xl">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">Signing you out...</h1>
          <p className="text-center text-xs text-neutral-400">
            We're securely logging you out. This will only take a moment.
          </p>
        </div>

        <div className="flex justify-center py-6">
          <Spinner size={56} label="Signing out..." />
        </div>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-neutral-500">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}