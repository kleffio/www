import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Settings, LogOut } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@shared/ui/Sheet";
import { Button } from "@shared/ui/Button";
import { UserMenu } from "@shared/ui/UserMenu";
import { cn } from "@shared/lib/utils";
import { useIdentity } from "@features/auth/hooks/useIdentity";
import { logoutEverywhere } from "@features/auth/api/logout";
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@app/navigation/Navigation";
import { ROUTES } from "@app/routes/routes";
import { Brand } from "@shared/ui/Brand";
import { UserAvatar } from "@shared/ui/UserAvatar";
import { NavItem } from "@app/navigation/components/NavItem";
import LocaleSwitcher from "@shared/ui/LocaleSwitcher";

export function DashboardNav() {
  const location = useLocation();

  return (
    <>
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-md lg:hidden">
        <MobileHeader />
      </header>

      <aside className="hidden h-screen w-64 flex-col border-r border-white/10 bg-black/40 lg:flex">
        <div className="flex h-14 items-center justify-start border-b border-white/10 px-3">
          <Brand />
          <LocaleSwitcher />
        </div>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              isActive={isNavItemActive(location.pathname, item)}
              variant="sidebar"
            />
          ))}
          
        </nav>
        <div className="border-t border-white/10 p-4">
        
          <UserMenu variant="full" align="left" dropdownPosition="top" />
        </div>
      </aside>
    </>
  );
}

function MobileHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, name, email, initial, isAuthenticated } = useIdentity();

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const handle = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, [open]);

  const handleSettings = useCallback(() => {
    setOpen(false);
    navigate(ROUTES.DASHBOARD_SETTINGS);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setOpen(false);
    await logoutEverywhere(auth);
  }, [auth]);

  const closeSheet = useCallback(() => setOpen(false), []);

  return (
    <div className="app-container flex h-12 items-center justify-between gap-4">
      <Brand size={20} fontSize="text-[10px]" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/80 text-neutral-200">
            <Menu className="h-4 w-4" />
          </button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className={cn(
            "flex h-full flex-col border-l border-white/10 bg-black/95 text-neutral-50",
            "w-full max-w-none sm:w-3/4 sm:max-w-sm"
          )}
        >
          <SheetHeader className="flex flex-row items-center justify-between border-b border-white/10 px-4 py-3 text-left sm:hidden">
            <Brand />
            <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
          </SheetHeader>

          <nav className="flex-1 px-4 py-5">
            <p className="mb-4 text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              Navigation
            </p>
            <div className="space-y-2">
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  isActive={isNavItemActive(location.pathname, item)}
                  onClick={closeSheet}
                  variant="mobile"
                />
              ))}
            </div>
          </nav>

          {isAuthenticated && (
            <div className="space-y-3 border-t border-white/10 p-4 pb-6">
              <UserAvatar initial={initial} name={name} email={email} />

              <div className="mt-2 flex flex-col gap-2">
                <Button
                  onClick={handleSettings}
                  variant="secondary"
                  className="flex items-center justify-center gap-2 border border-white/10 bg-white/5 py-2 font-medium text-neutral-200 hover:bg-white/10"
                >
                  <Settings size={16} className="opacity-80" />
                  Profile & settings
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/10 py-2 font-medium text-red-300 hover:bg-red-500/20"
                >
                  <LogOut size={16} />
                  Sign out
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
