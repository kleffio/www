import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@app/layout/AppLayout";
import { LandingPage } from "@pages/landing/LandingPage";
import { Dashboard } from "@pages/Dashboard/Dashboard";
import { ErrorPage } from "@app/error/ErrorPage";
import { Projects } from "@pages/Dashboard/Projects/Projects.tsx";
import { CreateProject } from "@pages/Dashboard/Projects/CreateProject.tsx";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { ErrorPage } from "@app/error/ErrorPage";
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
    element: <Dashboard />,
    errorElement: <ErrorPage />
  },
  {
    path: "/dashboard/projects",
    element: <Projects />,
    errorElement: <ErrorPage />
    },
  {
    path: "/dashboard/projects/create",
    element: <CreateProject />,
    errorElement: <ErrorPage />
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      }
    ]
  },
]);
