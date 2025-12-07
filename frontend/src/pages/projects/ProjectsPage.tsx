import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/ui/Table";
import { CreateProjectModal } from "@features/projects/components/CreateProjectModal";
import { useProjects } from "@features/projects/hooks/useProjects";

export function ProjectsPage() {
  const { projects, isLoading, error, reload } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSuccess = () => {
    void reload();
    setIsModalOpen(false);
  };

  return (
    <section className="h-full">
      <div className="app-container space-y-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50 md:text-3xl">Projects</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Create and manage your projects and deployments.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-kleff rounded-full px-5 py-2 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
          >
            Create project
          </Button>
        </header>

        {isLoading && (
          <SoftPanel>
            <div className="flex justify-center py-10">
              <p className="text-sm text-neutral-400">Loading projects…</p>
            </div>
          </SoftPanel>
        )}

        {!isLoading && error && (
          <SoftPanel>
            <p className="py-6 text-sm text-red-400">{error}</p>
          </SoftPanel>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <SoftPanel>
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-400">You don&apos;t have any projects yet.</p>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-kleff mt-4 rounded-full px-4 py-1.5 text-xs font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
              >
                Create your first project
              </Button>
            </div>
          </SoftPanel>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <>
            <div className="hidden md:block">
              <div className="mx-auto max-w-5xl">
                <SoftPanel className="overflow-hidden px-0 py-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                        <TableHead>NAME</TableHead>
                        <TableHead>DESCRIPTION</TableHead>
                        <TableHead>OWNER</TableHead>
                        <TableHead>STACK</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>CREATED DATE</TableHead>
                        <TableHead>UPDATED DATE</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((p) => (
                        <Link key={p.projectId} to={`/dashboard/projects/${p.projectId}`} className="contents">
                          <TableRow className="cursor-pointer hover:bg-white/10">
                            <TableCell className="font-semibold text-neutral-50">{p.name}</TableCell>
                            <TableCell className="text-neutral-300">{p.description || "—"}</TableCell>
                            <TableCell className="text-neutral-300">{p.ownerId || "—"}</TableCell>
                            <TableCell className="text-neutral-300">{p.stackId || "—"}</TableCell>
                            <TableCell className="text-neutral-300">{p.projectStatus || "—"}</TableCell>
                            <TableCell className="text-neutral-300">{p.createdDate || "—"}</TableCell>
                            <TableCell className="text-neutral-300">{p.updatedDate || "—"}</TableCell>
                          </TableRow>
                        </Link>
                      ))}
                    </TableBody>
                  </Table>
                </SoftPanel>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {projects.map((p) => (
                <Link
                  key={p.projectId}
                  to={`/dashboard/projects/${p.projectId}`}
                  className="block rounded-2xl border border-white/12 bg-black/50 px-4 py-3 hover:bg-black/60"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-50">{p.name}</p>
                  </div>

                  {p.description && (
                    <p className="mb-3 text-xs text-neutral-300">{p.description}</p>
                  )}

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                    <div>
                      <dt className="text-[10px] tracking-wide text-neutral-500 uppercase">Owner</dt>
                      <dd className="truncate text-neutral-200">{p.ownerId || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wide text-neutral-500 uppercase">Stack</dt>
                      <dd className="truncate text-neutral-200">{p.stackId || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wide text-neutral-500 uppercase">Status</dt>
                      <dd className="truncate text-neutral-200">{p.projectStatus || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wide text-neutral-500 uppercase">Created</dt>
                      <dd className="truncate text-neutral-200">{p.createdDate || "—"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[10px] tracking-wide text-neutral-500 uppercase">Updated</dt>
                      <dd className="truncate text-neutral-200">{p.updatedDate || "—"}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </section>
  );
}
