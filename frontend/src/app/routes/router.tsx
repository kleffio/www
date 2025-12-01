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
    element: <Dashboard />,
    errorElement: <ErrorPage />
  },
  {
    path: "/dashboard/system",
    element: <MetricsDashboard />,
    errorElement: <ErrorPage />
  }
]);
