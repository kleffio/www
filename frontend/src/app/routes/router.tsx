import { ErrorPage } from "@app/error/ErrorPage";
import { ProjectsPage } from "@pages/projects/ProjectsPage";
import { ProjectDetailPage } from "@pages/projects/ProjectDetailPage";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { AppLayout } from "@app/layout/AppLayout";
import { DashboardLayout } from "@app/layout/DashboardLayout";
import { ProtectedRoute } from "@app/routing/ProtectedRoute";
import { ProjectsProvider } from "@features/projects/context/ProjectsContext";
import { CallbackPage } from "@pages/auth/CallbackPage";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { MetricsDashboard } from "@pages/dashboard/MetricsDashboard";
import { LandingPage } from "@pages/landing/LandingPage";
import { ProjectsPage } from "@pages/projects/ProjectsPage";
import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import { SettingsPage } from "@pages/settings/SettingsPage";
import { AboutUsPage } from "@pages/aboutus/AboutUsPage";
import { FAQPage } from "@pages/legal/FAQPage";
import { PrivacyPolicyPage } from "@pages/legal/PrivacyPolicyPage";
import { TermsOfServicePage } from "@pages/legal/TermsOfServicePage";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },

      { path: "about", element: <AboutUsPage /> },
      { path: "faq", element: <FAQPage /> },
      { path: "terms", element: <TermsOfServicePage /> },
      { path: "privacy", element: <PrivacyPolicyPage /> },

      // Auth routes
      {
        path: "auth",
        children: [
          {
            path: "signin",
            element: <CallbackPage />
          },
          {
            path: "callback",
            element: <CallbackPage />
          }
        ]
      }
    ]
  },

  //  Dashboard
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: "projects",
        element: (
          <ProjectsProvider>
            <ProjectsPage />
          </ProjectsProvider>
        )
      },
      {
<<<<<<< HEAD
        path: "projects/:projectId",
        element: <ProjectDetailPage />
=======
<<<<<<< HEAD
        path: "settings",
        element: <SettingsPage />
=======
        path: "systems",
        element: <MetricsDashboard />
>>>>>>> 14c9cfc8b729cb54954f1427458969ac3197de7f
>>>>>>> main
      }
    ]
  }
]);
