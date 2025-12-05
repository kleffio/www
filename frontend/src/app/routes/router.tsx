import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@app/layout/AppLayout";
import { LandingPage } from "@pages/landing/LandingPage";
import { CallbackPage } from "@pages/auth/CallbackPage";
import { ErrorPage } from "@app/error/ErrorPage";
import { ProjectsPage } from "@pages/projects/ProjectsPage";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { DashboardLayout } from "@app/layout/DashboardLayout";
import { ProtectedRoute } from "@app/routing/ProtectedRoute";
import { ProjectsProvider } from "@features/projects/context/ProjectsContext";

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
      }
    ]
  }
]);
