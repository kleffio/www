import { Sidebar } from "@shared/ui/Sidebar";
import { useEffect, useState } from "react";
import axiosInstance from "@shared/axiosInstance/axiosInstance";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Button } from "@shared/ui/Button";
import { CreateProjectModal } from "@shared/ui/CreateProjectModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-semibold text-neutral-50">Projects</h1>
                      <p className="mt-1 text-sm text-neutral-400">Manage your projects and deployments</p>
                    </div>

                    <Button
                      onClick={() => setIsModalOpen(true)}
                      size="lg"
                      className="bg-gradient-kleff rounded-full px-6 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
                    >
                      Create Project
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-sm text-neutral-400">Loading projects…</div>
                  ) : error ? (
                    <div className="text-sm text-rose-400">{error}</div>
                  ) : projects.length === 0 ? (
                    <div className="text-sm text-neutral-400">No projects yet.</div>
                  ) : (
                    <SoftPanel>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="text-xs text-neutral-400/90 border-b border-white/10">
                              <th className="text-left py-3 px-4">Name</th>
                              <th className="text-left py-3 px-4">Description</th>
                              <th className="text-left py-3 px-4">Repository</th>
                              <th className="text-left py-3 px-4">Branch</th>
                              <th className="text-left py-3 px-4">Docker Compose</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projects.map((p) => (
                              <tr key={p.projectId ?? p.name} className="border-b border-white/6">
                                <td className="py-3 px-4 text-sm text-neutral-50 font-medium">{p.name}</td>
                                <td className="py-3 px-4 text-sm text-neutral-300">{p.description ?? "—"}</td>
                                <td className="py-3 px-4 text-sm">
                                  {p.repositoryUrl ? (
                                    <a href={p.repositoryUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Repo</a>
                                  ) : (
                                    <span className="text-neutral-400">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-neutral-300">{p.branch ?? "—"}</td>
                                <td className="py-3 px-4 text-sm text-neutral-300">{p.dockerComposePath ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </SoftPanel>
                  )}
                </section>
              </section>
            </section>
          </section>
        </section>
      </section>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
      />
    </section>
  );
}