import { useParams, Link } from "react-router-dom";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/ui/Table";
import { Spinner } from "@shared/ui/Spinner";
import { useProject } from "@features/projects/hooks/useProject";
import { useProjectContainers } from "@features/projects/hooks/useProjectContainers";
import { ROUTES } from "@app/routes/routes";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, isLoading: projectLoading, error: projectError } = useProject(projectId || "");
  const { containers, isLoading: containersLoading, error: containersError } = useProjectContainers(projectId || "");

  if (projectLoading) {
    return (
      <section className="h-full">
        <div className="app-container py-8">
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        </div>
      </section>
    );
  }

  if (projectError || !project) {
    return (
      <section className="h-full">
        <div className="app-container py-8">
          <SoftPanel>
            <div className="py-10 text-center">
              <p className="text-sm text-red-400">{projectError || "Project not found"}</p>
              <Link to={ROUTES.DASHBOARD_PROJECTS}>
                <Button size="sm" className="mt-4 rounded-full px-4 py-1.5 text-xs font-semibold">
                  Back to Projects
                </Button>
              </Link>
            </div>
          </SoftPanel>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full">
      <div className="app-container space-y-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to={ROUTES.DASHBOARD_PROJECTS}>
              <Button variant="ghost" size="sm" className="mb-2 rounded-full px-3 py-1 text-xs">
                ← Back to Projects
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-50 md:text-3xl">{project.name}</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {project.description || "No description available"}
            </p>
          </div>
        </header>

        <SoftPanel>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Project Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-neutral-400">Project ID</dt>
              <dd className="text-sm text-neutral-200">{project.projectId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-400">Owner</dt>
              <dd className="text-sm text-neutral-200">{project.ownerId || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-400">Stack</dt>
              <dd className="text-sm text-neutral-200">{project.stackId || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-400">Status</dt>
              <dd className="text-sm text-neutral-200">{project.projectStatus || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-400">Created Date</dt>
              <dd className="text-sm text-neutral-200">{project.createdDate || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-neutral-400">Updated Date</dt>
              <dd className="text-sm text-neutral-200">{project.updatedDate || "—"}</dd>
            </div>
          </dl>
        </SoftPanel>

        <SoftPanel>
          <h2 className="mb-4 text-lg font-semibold text-neutral-50">Running Containers</h2>

          {containersLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {containersError && (
            <p className="py-6 text-sm text-red-400">{containersError}</p>
          )}

          {!containersLoading && !containersError && containers.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-400">No running containers for this project.</p>
            </div>
          )}

          {!containersLoading && !containersError && containers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                  <TableHead>NAME</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>IMAGE</TableHead>
                  <TableHead>PORTS</TableHead>
                  <TableHead>CREATED AT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.containerId}>
                    <TableCell className="font-semibold text-neutral-50">{container.name}</TableCell>
                    <TableCell className="text-neutral-300">{container.status}</TableCell>
                    <TableCell className="text-neutral-300">{container.image}</TableCell>
                    <TableCell className="text-neutral-300">
                      {container.ports.length > 0 ? container.ports.join(", ") : "—"}
                    </TableCell>
                    <TableCell className="text-neutral-300">{container.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SoftPanel>
      </div>
    </section>
  );
}
