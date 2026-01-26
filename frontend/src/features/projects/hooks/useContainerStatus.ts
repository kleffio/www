import { useState, useEffect, useCallback } from "react";

export type ContainerStatus = "Online" | "Offline" | "Checking" | "Error";

interface UseContainerStatusReturn {
  status: ContainerStatus;
  lastChecked: Date | null;
  checkStatus: () => Promise<void>;
}

export function useContainerStatus(containerUrl: string, pollInterval = 30000): UseContainerStatusReturn {
  const [status, setStatus] = useState<ContainerStatus>("Checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkStatus = useCallback(async () => {
    if (!containerUrl) {
      setStatus("Error");
      return;
    }

    setStatus("Checking");

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      await fetch(containerUrl, {
        method: 'HEAD',
        mode: 'no-cors', // Handle CORS issues
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // With no-cors mode, we can't read the response status
      // But if we get here without error, the server responded
      setStatus("Online");
      setLastChecked(new Date());

    } catch (error: unknown) {
      const err = error as { name?: string };

      if (err.name === 'AbortError') {
        // Timeout
        setStatus("Offline");
      } else {
        // Network error or CORS blocked
        // For CORS errors, we can't definitively say if the site is down
        // But we'll treat it as potentially offline
        setStatus("Offline");
      }

      setLastChecked(new Date());
    }
  }, [containerUrl]);

  // Initial check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      checkStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [checkStatus, pollInterval]);

  return {
    status,
    lastChecked,
    checkStatus,
  };
}
