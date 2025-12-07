import type { ElementType } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Server,
  Cpu,
  Boxes,
  Activity,
  Workflow,
  BookOpenText,
  Code2,
  GitBranch,
  Users,
  RocketIcon,
  ShieldIcon
} from "lucide-react";
import { ROUTES } from "@app/routes/routes";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: ROUTES.DASHBOARD_PROJECTS, label: "Projects", icon: FolderKanban },
  { to: ROUTES.DASHBOARD_SYSTEMS, label: "Systems", icon: Server }
];

export function isNavItemActive(pathname: string, item: DashboardNavItem): boolean {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}

export interface MegaMenuItem {
  label: string;
  href: string;
  description: string;
  icon: ElementType;
}

export interface MegaMenuSection {
  key: string;
  label: string;
  tagline: string;
  items: MegaMenuItem[];
}

export const MEGA_MENU_SECTIONS: MegaMenuSection[] = [
  {
    key: "product",
    label: "Product",
    tagline: "Everything you need to ship modern services.",
    items: [
      {
        label: "Overview",
        href: ROUTES.HOME,
        description: "Deploy, scale, and observe your apps on Kleff.",
        icon: Boxes
      },
      {
        label: "Deployments",
        href: ROUTES.DEPLOYMENTS,
        description: "Git-based deployments with rollbacks.",
        icon: GitBranch
      },
      {
        label: "Runtime",
        href: ROUTES.RUNTIME,
        description: "Managed runtimes tuned for modern stacks.",
        icon: Cpu
      },
      {
        label: "Observability",
        href: ROUTES.OBSERVABILITY,
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
        href: ROUTES.DOCS,
        description: "Everything you need to get started.",
        icon: BookOpenText
      },
      {
        label: "API Reference",
        href: ROUTES.DOCS_API,
        description: "REST and CLI endpoints for automation.",
        icon: Code2
      },
      {
        label: "SDKs",
        href: ROUTES.SDKS,
        description: "Language & framework integrations.",
        icon: Boxes
      },
      {
        label: "Changelog",
        href: ROUTES.CHANGELOG,
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
        href: ROUTES.SOLUTIONS_STARTUPS,
        description: "Ship faster with sane defaults and pricing.",
        icon: RocketIcon
      },
      {
        label: "Agencies",
        href: ROUTES.SOLUTIONS_AGENCIES,
        description: "Multi-tenant projects for your clients.",
        icon: Users
      },
      {
        label: "Indie hackers",
        href: ROUTES.SOLUTIONS_INDIE,
        description: "Pay only for what you actually use.",
        icon: Activity
      },
      {
        label: "Enterprise",
        href: ROUTES.SOLUTIONS_ENTERPRISE,
        description: "Controls & compliance for larger orgs.",
        icon: ShieldIcon
      }
    ]
  }
];

export const SIMPLE_NAV_LINKS = [
  { href: ROUTES.PRICING, label: "Pricing" },
  { href: ROUTES.DOCS, label: "Docs" },
  { href: ROUTES.BLOG, label: "Blog" }
];
