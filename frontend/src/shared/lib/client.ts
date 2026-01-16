import axios from "axios";

export const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
  withCredentials: true
});

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

client.interceptors.request.use((config) => {
  if (accessToken && !config.url?.includes("/session")) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes("/auth/logout") ||
      originalRequest.url?.includes("/auth/callback") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && import.meta.env.VITE_USE_BFF === "true") {
      originalRequest._retry = true;

      try {
        await client.post("/api/v1/auth/refresh", {}, { withCredentials: true });

        return client.request(originalRequest);
      } catch (refreshError) {
        console.error("Session refresh failed:", refreshError);

        setAccessToken(null);

        window.location.href = "/auth/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);