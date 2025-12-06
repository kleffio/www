import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { LogOut, Settings } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { Button } from "@shared/ui/Button";
import { logoutEverywhere } from "@features/auth/api/logout";

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

  // Get user info from auth
  const userName = auth.user?.profile.preferred_username || auth.user?.profile.name || "Account";
  const userEmail = auth.user?.profile.email;
  const initial = (userName || userEmail || "K").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logoutEverywhere(auth);
  };

  const handleOpenSettings = () => {
    setMenuOpen(false);
    navigate("/dashboard/settings");
  };

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="ghost"
        size={variant === "compact" ? "sm" : "lg"}
        onClick={() => setMenuOpen((open) => !open)}
        className={cn(
          "flex items-center gap-3 rounded-lg bg-white/5 text-left text-neutral-200 transition hover:bg-white/10",
          variant === "compact" ? "px-2 py-1.5" : "px-3 py-2"
        )}
      >
        <div
          className={cn(
            "bg-gradient-kleff flex shrink-0 items-center justify-center rounded-full font-semibold text-black",
            variant === "compact" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm"
          )}
        >
          {initial}
        </div>

        {variant === "full" && (
          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="truncate text-xs font-medium text-neutral-200">{userName}</div>
            {userEmail && <div className="truncate text-[10px] text-neutral-500">{userEmail}</div>}
          </div>
        )}
      </Button>

      {menuOpen && (
        <div
          className={cn(
            "absolute z-50 w-44 rounded-lg border border-white/10 bg-black/95 p-1 text-xs shadow-xl backdrop-blur-sm",
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleOpenSettings}
            className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-left text-neutral-200 hover:bg-white/10"
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
