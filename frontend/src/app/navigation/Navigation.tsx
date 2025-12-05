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

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { to: "/dashboard/systems", label: "Systems", icon: Server }
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

export const SIMPLE_NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" }
];
