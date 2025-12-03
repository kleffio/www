import { Sidebar } from "@shared/ui/Sidebar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@shared/axiosInstance/axiosInstance";

type Project = {
  projectId?: string;
  name: string;
  description?: string;
  repositoryUrl?: string;
  branch?: string;
  dockerComposePath?: string;
};

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get("/api/v1/projects");
        if (mounted) setProjects(res.data ?? []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        if (mounted) setError("Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProjects();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-kleff-bg relative isolate flex h-screen overflow-hidden">
      <section className="pointer-events-none absolute inset-0 -z-20">
        <section className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
        <section className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
      </section>
      <section className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-white/10 via-transparent" />
      <section className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black via-transparent" />
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <section className="app-container py-8">
          <section className="mb-8">
            <section className="flex items-start justify-between">
              <section>
                <section className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <Link
                      to="/dashboard/projects/create"
                      className="bg-sky-600 text-white px-3 py-2 rounded"
                    >
                      Create Project
                    </Link>
                  </div>

                  {loading ? (
                    <p>Loading projects…</p>
                  ) : error ? (
                    <p className="text-red-600">{error}</p>
                  ) : projects.length === 0 ? (
                    <p>No projects yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docker Compose</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {projects.map((p) => (
                            <tr key={p.projectId ?? p.name}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                              <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{p.description ?? "—"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                {p.repositoryUrl ? (
                                  <a href={p.repositoryUrl} target="_blank" rel="noreferrer" className="underline">Repo</a>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.branch ?? "—"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.dockerComposePath ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </section>
            </section>
          </section>
        </section>
      </section>
    </section>
  );
}