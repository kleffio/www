import { ErrorPage } from "@app/error/ErrorPage";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
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
  {
    path: "/dashboard",

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
        path: "systems",
        element: <MetricsDashboard />
      }
    ]
  }
]);
