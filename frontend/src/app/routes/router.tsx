import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@app/layout/AppLayout";
import { LandingPage } from "@pages/landing/LandingPage";
import { DashboardPage } from "@pages/dashboard/DashboardPage";
import { ErrorPage } from "@app/error/ErrorPage";

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
  }
]);
