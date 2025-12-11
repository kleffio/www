import { useEffect, useState } from "react";
import type { Container } from "@features/projects/types/Container";
import fetchProjectContainers from "@features/projects/api/getProjectContainers";

export function useProjectContainers(projectId: string) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadContainers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProjectContainers(projectId);
        setContainers(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load containers");
      } finally {
        setIsLoading(false);
      }
    };

    void loadContainers();
  }, [projectId]);

  const reload = () => {
    if (projectId) {
      const loadContainers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchProjectContainers(projectId);
          setContainers(data);
        } catch (err: any) {
          setError(err?.message || "Failed to load containers");
        } finally {
          setIsLoading(false);
        }
      };

      void loadContainers();
    }
  };

  return { containers, isLoading, error, reload };
}
