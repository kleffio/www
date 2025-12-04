import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@shared/ui/Sheet";
import { KleffDot } from "@shared/ui/KleffDot";
import { cn } from "@shared/lib/utils";
import {
  DASHBOARD_NAV_ITEMS,
  isNavItemActive,
} from "@app/layout/DashboardNav";

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    if (mq.matches) setOpen(false);

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <header className="border-b border-white/10 bg-black/70 backdrop-blur-md lg:hidden">
      <div className="app-container flex h-12 items-center justify-between gap-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <KleffDot variant="full" size={20} />
          <span className="text-[10px] font-semibold tracking-[0.32em] text-neutral-100">
            LEFF
          </span>
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
            <SheetHeader className="sm:hidden flex flex-row items-center justify-between border-b border-white/10 px-4 py-3 text-left">
              <div className="flex items-center gap-2">
                <KleffDot variant="full" size={22} />
                <SheetTitle className="text-xs font-semibold tracking-[0.32em] text-neutral-100">
                  LEFF
                </SheetTitle>
              </div>
            </SheetHeader>

            <nav className="flex-1 px-4 py-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
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
                          ? "bg-gradient-to-r from-white/12 to-white/5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                          : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-200 transition-colors",
                          active &&
                            "border-[#FFD56A]/70 bg-[#FFD56A]/10 text-[#FFD56A]"
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
