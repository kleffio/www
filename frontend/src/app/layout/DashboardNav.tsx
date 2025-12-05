import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Settings, LogOut } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@shared/ui/Sheet";
import { KleffDot } from "@shared/ui/KleffDot";
import { Button } from "@shared/ui/Button";
import { UserMenu } from "@shared/ui/UserMenu";
import { cn } from "@shared/lib/utils";
import { useIdentity } from "@features/auth/hooks/useIdentity";
import { logoutEverywhere } from "@features/auth/api/logout";
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@app/navigation/Navigation";

export function DashboardNav() {
  const location = useLocation();

  return (
    <>
      <header className="border-b border-white/10 bg-black/70 backdrop-blur-md lg:hidden">
        <MobileHeader />
      </header>

      <aside className="hidden h-screen w-64 flex-col border-r border-white/10 bg-black/40 lg:flex">
        <Link to="/" className="flex h-14 items-center justify-start border-b border-white/10 px-3">
          <div className="flex items-center gap-2">
            <KleffDot variant="full" size={22} />
            <span className="text-[13px] font-semibold tracking-[0.32em] text-neutral-100">
              LEFF
            </span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 px-2 py-3">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isNavItemActive(location.pathname, item);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2 transition-all",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white/90"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-0 h-full w-0.5 rounded-r bg-linear-to-b from-[#FFD56A] to-[#B8860B] shadow-[0_0_6px_2px_rgba(255,213,106,0.35)]" />
                )}
                <div className="flex h-6 w-6 items-center justify-center">
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
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
    const mq = window.matchMedia("(min-width: 1024px)");
    const handle = (e: MediaQueryListEvent) => e.matches && setOpen(false);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  const handleSettings = () => {
    setOpen(false);
    navigate("/dashboard/settings");
  };

  const handleLogout = async () => {
    setOpen(false);
    await logoutEverywhere(auth);
  };

  return (
    <div className="app-container flex h-12 items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2">
        <KleffDot variant="full" size={20} />
        <span className="text-[10px] font-semibold tracking-[0.32em] text-neutral-100">LEFF</span>
      </Link>

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
            <div className="flex items-center gap-2">
              <KleffDot variant="full" size={22} />
              <SheetTitle className="text-xs font-semibold tracking-[0.32em] text-neutral-100">
                LEFF
              </SheetTitle>
            </div>
          </SheetHeader>

          <nav className="flex-1 px-4 py-5">
            <p className="mb-4 text-[11px] font-medium tracking-[0.16em] text-neutral-500 uppercase">
              Navigation
            </p>
            <div className="space-y-2">
              {DASHBOARD_NAV_ITEMS.map((item) => {
                const active = isNavItemActive(location.pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all",
                      active
                        ? "bg-linear-to-r from-white/12 to-white/5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-200",
                        active && "border-[#FFD56A]/70 bg-[#FFD56A]/10 text-[#FFD56A]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {isAuthenticated && (
            <div className="space-y-3 border-t border-white/10 p-4 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-kleff flex h-10 w-10 items-center justify-center rounded-full font-semibold text-black">
                  {initial}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{name}</span>
                  <span className="truncate text-xs text-neutral-400">{email}</span>
                </div>
              </div>

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
