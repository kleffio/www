import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@app/layout/AppLayout";
import { LandingPage } from "@pages/landing/LandingPage";
import { ErrorPage } from "@app/error/ErrorPage";
import { ProjectsPage } from "@pages/projects/ProjectsPage";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { DashboardLayout } from "@app/layout/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
        errorElement: <ErrorPage />
      }
    ]
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: "projects",
        element: <ProjectsPage />
      }
    ]
  },
]);
