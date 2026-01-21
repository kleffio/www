import { useEffect, useState } from "react";
import type { Project } from "@features/projects/types/Project";
import fetchProject from "@features/projects/api/getProject";

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProject(projectId);
        setProject(data);
      } catch (err: unknown) {
        const error = err as { message?: string };
        setError(error?.message || "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  const reload = () => {
    if (projectId) {
      const loadProject = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchProject(projectId);
          setProject(data);
        } catch (err: unknown) {
          const error = err as { message?: string };
          setError(error?.message || "Failed to load project");
        } finally {
          setIsLoading(false);
        }
      };

      void loadProject();
    }
  };

  return { project, isLoading, error, reload };
}
