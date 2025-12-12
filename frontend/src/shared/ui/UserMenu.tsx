import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { Button } from "@shared/ui/Button";
import { logoutEverywhere } from "@features/auth/api/logout";
import { UserAvatar } from "./UserAvatar";
import { ROUTES } from "@app/routes/routes";
import { useUserSettings } from "@features/users/hooks/useUserSettings";

interface UserMenuProps {
  variant?: "compact" | "full";
  align?: "left" | "right";
  dropdownPosition?: "top" | "bottom";
  className?: string;
}

export function UserMenu({
  variant = "full",
  align = "left",
  dropdownPosition = "bottom",
  className
}: UserMenuProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { settings } = useUserSettings();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (!auth.isAuthenticated) return null;

  // Prefer user-service profile, then Authentik profile
  const profileName =
    settings?.displayName?.trim() ||
    settings?.handle?.trim() ||
    auth.user?.profile.preferred_username ||
    auth.user?.profile.name ||
    "Account";

  const profileEmail = settings?.email || auth.user?.profile.email || undefined;

  // Safely read OIDC picture without `any`
  const profile = auth.user?.profile as Record<string, unknown> | undefined;
  const rawPicture = profile?.["picture"];
  const oidcPicture = typeof rawPicture === "string" ? rawPicture : undefined;

  const avatarSrc = settings?.avatarUrl || oidcPicture;
  const initial = (profileName || profileEmail || "K").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logoutEverywhere(auth);
  };

  const handleOpenSettings = () => {
    setMenuOpen(false);
    navigate(ROUTES.DASHBOARD_SETTINGS);
  };

  const handleOpenDashboard = () => {
    setMenuOpen(false);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size={variant === "compact" ? "icon" : "lg"}
        onClick={() => setMenuOpen((open) => !open)}
        className={cn(
          "flex items-center gap-2 rounded-full bg-transparent px-0 py-0 hover:bg-transparent",
          "focus-visible:ring-kleff-gold/70 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          variant === "full" && "py-1.5 pr-3 pl-1"
        )}
      >
        <UserAvatar initial={initial} size={variant === "compact" ? "sm" : "md"} src={avatarSrc} />

        {variant === "full" && (
          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="truncate text-xs font-medium text-neutral-200">{profileName}</div>
            {profileEmail && (
              <div className="truncate text-[10px] text-neutral-500">{profileEmail}</div>
            )}
          </div>
        )}
      </Button>

      {menuOpen && (
        <div
          className={cn(
            "absolute z-50 w-44 rounded-xl border border-white/10 bg-black/95 p-1.5 text-xs shadow-2xl backdrop-blur-md",
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOpenDashboard}
            className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-neutral-200 hover:bg-white/10"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOpenSettings}
            className="mt-0.5 flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-neutral-200 hover:bg-white/10"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Profile &amp; settings</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="mt-0.5 flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-neutral-200 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </Button>
        </div>
      )}
    </div>
  );
}
