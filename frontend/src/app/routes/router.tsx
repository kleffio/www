<<<<<<< HEAD
=======
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@app/layout/AppLayout";
import { LandingPage } from "@pages/landing/LandingPage";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
>>>>>>> 9abad9539028c91216b9890f886d20e1d87a44c1
import { ErrorPage } from "@app/error/ErrorPage";
import { AppLayout } from "@app/layout/AppLayout";
import { Dashboard } from "@pages/Dashboard/Dashboard";
import { MetricsDashboard } from "@pages/Dashboard/MetricsDashboard";
import { LandingPage } from "@pages/landing/LandingPage";
import { createBrowserRouter } from "react-router-dom";
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
    element: <DashboardPage />,
    errorElement: <ErrorPage />
<<<<<<< HEAD
  },
  {
    path: "/dashboard/system",
    element: <MetricsDashboard />,
    errorElement: <ErrorPage />
=======
>>>>>>> 9abad9539028c91216b9890f886d20e1d87a44c1
  }
]);
