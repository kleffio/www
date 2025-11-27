import * as React from "react";
import { Link } from "react-router-dom";
import { MenuIcon, RocketIcon, ShieldIcon, ChevronDown } from "lucide-react";

import { cn } from "@shared/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@widgets/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@shared/ui/Sheet";
import { Button } from "@shared/ui/Button";
import { UnderlineLink } from "@shared/ui/UnderlineLink";

import {
  Cpu,
  Boxes,
  Activity,
  Workflow,
  BookOpenText,
  Code2,
  GitBranch,
  Users
} from "lucide-react";
import { KleffDot } from "@shared/ui/KleffDot";

type MegaKey = "product" | "developers" | "solutions";

type MegaItem = {
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type MegaSection = {
  key: MegaKey;
  label: string;
  tagline: string;
  items: MegaItem[];
};

const MEGA_SECTIONS: MegaSection[] = [
  {
    key: "product",
    label: "Product",
    tagline: "Everything you need to ship modern services.",
    items: [
      {
        label: "Overview",
        href: "/",
        description: "Deploy, scale, and observe your apps on Kleff.",
        icon: Boxes
      },
      {
        label: "Deployments",
        href: "/deployments",
        description: "Git-based deployments with rollbacks.",
        icon: GitBranch
      },
      {
        label: "Runtime",
        href: "/runtime",
        description: "Managed runtimes tuned for modern stacks.",
        icon: Cpu
      },
      {
        label: "Observability",
        href: "/observability",
        description: "Metrics, logs, and alerts out of the box.",
        icon: Activity
      }
    ]
  },
  {
    key: "developers",
    label: "Developers",
    tagline: "Tools that feel like they were built by devs, for devs.",
    items: [
      {
        label: "Docs",
        href: "/docs",
        description: "Everything you need to get started.",
        icon: BookOpenText
      },
      {
        label: "API Reference",
        href: "/docs/api",
        description: "REST and CLI endpoints for automation.",
        icon: Code2
      },
      {
        label: "SDKs",
        href: "/sdks",
        description: "Language & framework integrations.",
        icon: Boxes
      },
      {
        label: "Changelog",
        href: "/changelog",
        description: "Follow platform updates week by week.",
        icon: Workflow
      }
    ]
  },
  {
    key: "solutions",
    label: "Solutions",
    tagline: "Kleff for teams of every size.",
    items: [
      {
        label: "Startups",
        href: "/solutions/startups",
        description: "Ship faster with sane defaults and pricing.",
        icon: RocketIcon
      },
      {
        label: "Agencies",
        href: "/solutions/agencies",
        description: "Multi-tenant projects for your clients.",
        icon: Users
      },
      {
        label: "Indie hackers",
        href: "/solutions/indie",
        description: "Pay only for what you actually use.",
        icon: Activity
      },
      {
        label: "Enterprise",
        href: "/solutions/enterprise",
        description: "Controls & compliance for larger orgs.",
        icon: ShieldIcon
      }
    ]
  }
];

export function AppHeader() {
  return (
    <header className="border-border/60 sticky top-0 z-40 border-b">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#0f0f10]/95 via-[#0f0f10]/90 to-[#0f0f10]/95" />
      <div className="pointer-events-none absolute inset-0 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]" />

      <div className="app-container relative flex h-12 items-center gap-6 md:h-14">
        <div className="flex flex-1 items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <KleffDot variant="full" size={22} />
              <span className="text-foreground text-[14px] font-semibold tracking-[0.32em] uppercase">
                LEFF
              </span>
            </div>
          </Link>

          <div className="hidden lg:block">
            <DesktopNav />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/auth/sign-in">
            <Button
              variant="outline"
              size="sm"
              className="border-white/18 bg-transparent text-[11px] font-medium hover:border-white/40 hover:bg-white/5"
            >
              Sign in
            </Button>
          </Link>

          <Link to="/auth/sign-up">
            <Button
              size="sm"
              className="bg-gradient-kleff text-[11px] font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
            >
              Start your project
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link to="/auth/sign-in">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted hover:text-foreground hidden text-[11px] font-medium sm:inline-flex"
            >
              Sign in
            </Button>
          </Link>

          <Link to="/auth/sign-up">
            <Button
              size="sm"
              className="bg-gradient-kleff hidden text-[11px] font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 sm:inline-flex"
            >
              Start
            </Button>
          </Link>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}

/* ---------- Desktop nav ---------- */

function DesktopNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList className="flex items-center gap-1 text-sm">
        {MEGA_SECTIONS.map((section) => (
          <NavigationMenuItem key={section.key}>
            <AnimatedTrigger>{section.label}</AnimatedTrigger>

            <AnimatedContent>
              {section.key === "product" ? (
                <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,2.1fr)] gap-8 py-5 md:w-[680px] lg:w-[840px]">
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <p className="text-foreground text-sm font-semibold">{section.label}</p>
                      <p className="text-muted-foreground/90 text-sm">{section.tagline}</p>
                    </div>

                    <div className="space-y-1.5">
                      {section.items.map((item) => {
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
                                <div className="text-foreground text-sm font-medium">
                                  {item.label}
                                </div>
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
                        Teams use Kleff to deploy fleets of services, keep infra observable, and
                        stay in full control whether self-hosted or managed.
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
              ) : (
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
                    {section.items.map((item) => {
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
                              <div className="text-foreground text-xs font-medium">
                                {item.label}
                              </div>
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
              )}
            </AnimatedContent>
          </NavigationMenuItem>
        ))}

        {[
          { href: "/pricing", label: "Pricing" },
          { href: "/docs", label: "Docs" },
          { href: "/blog", label: "Blog" }
        ].map((link) => (
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

/* ---------- Animated trigger & content ---------- */

function AnimatedTrigger(props: React.ComponentPropsWithoutRef<typeof NavigationMenuTrigger>) {
  const { className, ...rest } = props;

  return (
    <NavigationMenuTrigger
      {...rest}
      className={cn(
        "text-muted relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
        "hover:text-foreground hover:bg-white/5",
        "data-[state=open]:text-foreground data-[state=open]:bg-white/5",
        className
      )}
    />
  );
}

function AnimatedContent(props: React.ComponentPropsWithoutRef<typeof NavigationMenuContent>) {
  const { className, ...rest } = props;

  return <NavigationMenuContent {...rest} className={cn("p-4", className)} />;
}

/* ---------- Mobile nav ---------- */

function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(["product"]));

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs shadow-sm transition-colors hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full border-l border-white/10 bg-linear-to-b from-[#18181a]/98 via-[#16161a]/98 to-[#18181a]/98 px-0 pt-0 pb-0 sm:w-[85vw] sm:max-w-sm"
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-kleff h-6 w-6 rounded-lg shadow-lg" />
            <span className="text-foreground text-base font-semibold">Kleff</span>
          </div>
        </div>

        <nav className="overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(100vh - 73px)" }}>
          <div className="space-y-4">
            {MEGA_SECTIONS.map((section) => {
              const isExpanded = expandedSections.has(section.key);
              return (
                <div key={section.label} className="border-b border-white/8 pb-4 last:border-0">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="group flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex-1">
                      <div className="text-foreground mb-0.5 flex items-center gap-2 text-sm font-semibold">
                        {section.label}
                        <ChevronDown
                          className={cn(
                            "text-muted-foreground h-3.5 w-3.5 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                      <div className="text-muted-foreground text-xs">{section.tagline}</div>
                    </div>
                  </button>

                  <div
                    className={cn(
                      "grid transition-all duration-200 ease-in-out",
                      isExpanded ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setOpen(false)}
                              className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                            >
                              <div className="text-muted-foreground group-hover:text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/5">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-foreground text-sm font-medium">
                                  {item.label}
                                </div>
                                <div className="text-muted-foreground text-xs leading-relaxed">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="space-y-1 border-t border-white/8 pt-4">
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/docs", label: "Docs" },
                { href: "/blog", label: "Blog" }
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="text-foreground block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-2 border-t border-white/8 pt-4">
              <Link to="/auth/sign-in" onClick={() => setOpen(false)} className="block">
                <Button
                  variant="outline"
                  className="h-11 w-full border-white/20 bg-transparent font-medium hover:border-white/40 hover:bg-white/5"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/auth/sign-up" onClick={() => setOpen(false)} className="block">
                <Button className="bg-gradient-kleff h-11 w-full font-semibold text-black shadow-lg hover:brightness-110">
                  Start your project
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
