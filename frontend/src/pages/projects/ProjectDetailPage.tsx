import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/ui/Table";
import { Spinner } from "@shared/ui/Spinner";
import { MiniCard } from "@shared/ui/MiniCard";
import { Badge } from "@shared/ui/Badge";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Hash, User, Layers, Activity, Calendar, Clock, Box } from "lucide-react";
import { useProject } from "@features/projects/hooks/useProject";
import { useProjectContainers } from "@features/projects/hooks/useProjectContainers";
import { CreateContainerModal } from "@features/projects/components/CreateContainerModal";
import { ROUTES } from "@app/routes/routes";
import enTranslations from "@app/locales/en.json";
import frTranslations from "@app/locales/fr.json";
import { getLocale } from "@app/locales/locale";

const translations = {
  en: enTranslations,
  fr: frTranslations
};

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, isLoading: projectLoading, error: projectError } = useProject(projectId || "");
  const {
    containers,
    isLoading: containersLoading,
    error: containersError,
    reload
  } = useProjectContainers(projectId || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locale, setLocaleState] = useState(getLocale());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLocale = getLocale();
      if (currentLocale !== locale) {
        setLocaleState(currentLocale);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [locale]);

  const t = translations[locale].projectDetail;

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
              <p className="text-sm text-red-400">{projectError || t.project_not_found}</p>
              <Link to={ROUTES.DASHBOARD_PROJECTS}>
                <Button size="sm" className="mt-4 rounded-full px-4 py-1.5 text-xs font-semibold">
                  {t.back_to_projects}
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
                {t.back_to_projects_arrow}
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-50 md:text-3xl">{project.name}</h1>
            <p className="mt-1 text-sm text-neutral-400">
              {project.description || t.no_description}
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-kleff rounded-full px-5 py-2 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
          >
            {t.create_container}
          </Button>
        </header>

        <SoftPanel>
          <h2 className="mb-6 text-lg font-semibold text-neutral-50">{t.project_overview}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MiniCard title={t.project_id}>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-200">{project.projectId || "—"}</span>
              </div>
            </MiniCard>
            <MiniCard title={t.owner}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-200">{project.ownerId || "—"}</span>
              </div>
            </MiniCard>
            <MiniCard title={t.stack}>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-200">{project.stackId || "—"}</span>
              </div>
            </MiniCard>
            <MiniCard title={t.status}>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-neutral-400" />
                {project.projectStatus ? (
                  <Badge variant="success" className="text-xs">
                    {project.projectStatus}
                  </Badge>
                ) : (
                  <span className="text-sm text-neutral-400">—</span>
                )}
              </div>
            </MiniCard>
            <MiniCard title={t.created}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-200">{project.createdDate || "—"}</span>
              </div>
            </MiniCard>
            <MiniCard title={t.last_updated}>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-200">{project.updatedDate || "—"}</span>
              </div>
            </MiniCard>
          </div>
        </SoftPanel>

        <SoftPanel>
          <div className="mb-6 flex items-center gap-3">
            <GradientIcon icon={Box} />
            <h2 className="text-lg font-semibold text-neutral-50">{t.running_containers}</h2>
            {containers && containers.length > 0 && (
              <Badge variant="info" className="text-xs">
                {containers.length} {containers.length === 1 ? t.container : t.containers}
              </Badge>
            )}
          </div>

          {containersLoading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {containersError && <p className="py-6 text-sm text-red-400">{containersError}</p>}

          {!containersLoading && !containersError && containers.length === 0 && (
            <div className="py-10 text-center">
              <div className="flex flex-col items-center gap-3">
                <Box className="h-12 w-12 text-neutral-500" />
                <p className="text-sm text-neutral-400">{t.no_containers}</p>
                <p className="text-xs text-neutral-500">{t.create_first_container}</p>
              </div>
            </div>
          )}

          {!containersLoading && !containersError && containers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                  <TableHead>{t.table.name}</TableHead>
                  <TableHead>{t.table.status}</TableHead>
                  <TableHead>{t.table.image}</TableHead>
                  <TableHead>{t.table.ports}</TableHead>
                  <TableHead>Repository URL</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>{t.table.created_at}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.containerId} className="hover:bg-white/5">
                    <TableCell>
                      <span className="font-semibold text-neutral-50">{container.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          container.status?.toLowerCase().includes("running")
                            ? "success"
                            : container.status?.toLowerCase().includes("stopped")
                              ? "secondary"
                              : "warning"
                        }
                        className="text-xs"
                      >
                        {container.status || t.unknown}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-300">
                      {container.image}
                    </TableCell>
                    <TableCell className="text-neutral-300">
                      {container.ports.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {container.ports.map((port, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="px-1.5 py-0.5 text-[10px]"
                            >
                              {port}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-300">
                      {container.repoUrl || <span className="text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-300">
                      {container.branch || <span className="text-neutral-500">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-300">
                      {container.createdAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SoftPanel>
      </div>

      <CreateContainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId || ""}
        onSuccess={() => reload()}
      />
    </section>
  );
}
