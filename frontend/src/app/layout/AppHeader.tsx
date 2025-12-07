import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useCallback } from "react";
import { UserMenu } from "@shared/ui/UserMenu";
import { MobileSheetNav } from "@app/navigation/components/MobileSheetNav";
import { DesktopMegaMenu } from "@app/navigation/components/DesktopMegaMenu";
import { ROUTES } from "@app/routes/routes";
import { NavLogo } from "@shared/ui/Brand";
import { AuthButtons } from "@features/auth/components/AuthButtons";

export function AppHeader() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    navigate(auth.isAuthenticated ? ROUTES.DASHBOARD : ROUTES.AUTH_SIGNIN);
  }, [auth.isAuthenticated, navigate]);

  return (
    <header className="border-border/60 sticky top-0 z-40 border-b">
      <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-[#0f0f10]/95 via-[#0f0f10]/90 to-[#0f0f10]/95" />
      <div className="pointer-events-none absolute inset-0 z-0 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]" />

      <div className="app-container relative z-10 flex h-12 items-center gap-6 md:h-14">
        <div className="flex flex-1 items-center gap-6">
          <NavLogo fontSize="text-[14px]" />
          <div className="hidden lg:block">
            <DesktopMegaMenu />
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {auth.isAuthenticated ? (
            <UserMenu variant="compact" align="right" />
          ) : (
            <AuthButtons onLogin={handleLogin} variant="desktop" />
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {!auth.isAuthenticated && <AuthButtons onLogin={handleLogin} variant="mobile" />}
          <MobileSheetNav />
        </div>
      </div>
    </header>
  );
}
