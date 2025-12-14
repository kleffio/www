export const routes = {
  home: "/",
  about: "/about",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",

  auth: {
    signin: "/auth/signin",
    callback: "/auth/callback"
  },

  dashboard: {
    root: "/dashboard",
    projects: "/dashboard/projects",
    project: (id: string) => `/dashboard/projects/${id}`,
    settings: "/dashboard/settings",
    systems: "/dashboard/systems"
  }
} as const;

export const storage = {
  authStatePath: "e2e/storage/auth.json"
} as const;
