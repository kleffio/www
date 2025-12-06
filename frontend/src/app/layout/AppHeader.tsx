import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@widgets/navigation-menu";
import { Button } from "@shared/ui/Button";
import { UnderlineLink } from "@shared/ui/UnderlineLink";
import { UserMenu } from "@shared/ui/UserMenu";
import { KleffDot } from "@shared/ui/KleffDot";
import { MobileSheetNav } from "@app/navigation/components/MobileSheetNav";
import { MEGA_MENU_SECTIONS, SIMPLE_NAV_LINKS } from "@app/navigation/Navigation";
import { cn } from "@shared/lib/utils";

export function AppHeader() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(auth.isAuthenticated ? "/dashboard" : "/auth/signin");
  };

  return (
    <header className="border-border/60 sticky top-0 z-40 border-b">
      <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-[#0f0f10]/95 via-[#0f0f10]/90 to-[#0f0f10]/95" />
      <div className="pointer-events-none absolute inset-0 z-0 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]" />

      <div className="app-container relative z-10 flex h-12 items-center gap-6 md:h-14">
        {/* Logo & Desktop Nav */}
        <div className="flex flex-1 items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <KleffDot variant="full" size={22} />
            <span className="text-foreground text-[14px] font-semibold tracking-[0.32em] uppercase">
              LEFF
            </span>
          </Link>
          <div className="hidden lg:block">
            <DesktopNav />
          </div>
        </div>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 lg:flex">
          {auth.isAuthenticated ? (
            <UserMenu variant="compact" align="right" />
          ) : (
            <>
              <Button
                onClick={handleLogin}
                variant="outline"
                size="sm"
                className="border-white/18 bg-transparent text-[11px] font-medium hover:border-white/40 hover:bg-white/5"
              >
                Sign in
              </Button>
              <Button
                onClick={handleLogin}
                size="sm"
                className="bg-gradient-kleff text-[11px] font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
              >
                Start your project
              </Button>
            </>
          )}
        </div>

        {/* Mobile Auth & Menu */}
        <div className="flex items-center gap-2 lg:hidden">
          {!auth.isAuthenticated && (
            <>
              <Button
                onClick={handleLogin}
                variant="ghost"
                size="sm"
                className="text-muted hover:text-foreground hidden text-[11px] font-medium sm:inline-flex"
              >
                Sign in
              </Button>
              <Button
                onClick={handleLogin}
                size="sm"
                className="bg-gradient-kleff hidden text-[11px] font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 sm:inline-flex"
              >
                Start
              </Button>
            </>
          )}
          <MobileSheetNav />
        </div>
      </div>
    </header>
  );
}

function DesktopNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center gap-1 text-sm">
        {MEGA_MENU_SECTIONS.map((section) => (
          <NavigationMenuItem key={section.key}>
            <NavigationMenuTrigger
              className={cn(
                "text-muted relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                "hover:text-foreground data-[state=open]:text-foreground hover:bg-white/5 data-[state=open]:bg-white/5"
              )}
            >
              {section.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-4">
              {section.key === "product" ? (
                <ProductMegaMenu section={section} />
              ) : (
                <DefaultMegaMenu section={section} />
              )}
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        {SIMPLE_NAV_LINKS.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink asChild>
              <UnderlineLink
                to={link.href}
                className="text-muted rounded-full px-4 py-1.5 text-sm font-medium hover:bg-white/5"
              >
                {link.label}
              </UnderlineLink>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProductMegaMenu({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,2.1fr)] gap-8 py-5 md:w-[680px] lg:w-[840px]">
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <p className="text-foreground text-sm font-semibold">{section.label}</p>
          <p className="text-muted-foreground/90 text-sm">{section.tagline}</p>
        </div>
        <div className="space-y-1.5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {section.items.map((item: any) => {
            const Icon = item.icon;
            return (
              <NavigationMenuLink asChild key={item.label}>
                <Link
                  to={item.href}
                  className="group flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-white/4"
                >
                  <div className="text-muted-foreground group-hover:border-primary/60 group-hover:text-primary mt-0.5 flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/40">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-foreground text-sm font-medium">{item.label}</div>
                    <div className="text-muted-foreground text-[12px] leading-snug">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </NavigationMenuLink>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
          <div className="text-muted text-[12px] font-semibold tracking-wide uppercase">
            CUSTOMER STORIES
          </div>
          <div className="text-foreground mt-2 text-sm font-medium">
            Built for fast-moving teams
          </div>
          <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
            Teams use Kleff to deploy fleets of services, keep infra observable, and stay in full
            control whether self-hosted or managed.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
          <div className="text-muted-foreground/80 text-[11px] font-semibold tracking-[0.18em] uppercase">
            COMPARE KLEFF
          </div>
          <ul className="text-muted-foreground mt-2 space-y-1.5 text-[12px]">
            <li>• Kleff vs Vercel</li>
            <li>• Kleff vs AWS Amplify</li>
            <li>• Kleff vs DIY Kubernetes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DefaultMegaMenu({ section }: { section: any }) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 py-4 md:w-[520px] lg:w-[640px]">
      <div className="flex flex-col justify-between gap-4 pr-6">
        <div className="space-y-1.5">
          <p className="text-foreground text-sm font-semibold">{section.label}</p>
          <p className="text-muted-foreground/90 text-sm">{section.tagline}</p>
        </div>
        <p className="text-muted-foreground/80 text-[11px]">
          Open-source-first infrastructure built for modern teams.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {section.items.map((item: any) => {
          const Icon = item.icon;
          return (
            <NavigationMenuLink asChild key={item.label}>
              <Link
                to={item.href}
                className="group hover:border-primary/60 relative flex items-start gap-3 rounded-xl border border-white/6 bg-black/30 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-white/5"
              >
                <div className="text-muted-foreground group-hover:text-primary mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-foreground text-xs font-medium">{item.label}</div>
                  <div className="text-muted-foreground text-[11px] leading-snug">
                    {item.description}
                  </div>
                </div>
              </Link>
            </NavigationMenuLink>
          );
        })}
      </div>
    </div>
  );
}
