import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Spinner } from "@shared/ui/Spinner";
import { MiniCard } from "@shared/ui/MiniCard";
import { Badge } from "@shared/ui/Badge";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Hash, User, Layers, Activity, Calendar, Clock, Box } from "lucide-react";
import { useProject } from "@features/projects/hooks/useProject";
import { useProjectContainers } from "@features/projects/hooks/useProjectContainers";
import { ContainerModal } from "@features/projects/components/CreateContainerModal";
import { EditEnvVariablesModal } from "@features/projects/components/EditEnvVariablesModal";
import { ContainerStatusCard } from "@features/projects/components/ContainerStatusCard";
import { ContainerDetailModal } from "@features/projects/components/ContainerDetailModal";
import updateContainerEnvVariables from "@features/projects/api/updateContainerEnvVariables";
import type { Container } from "@features/projects/types/Container";
import { ROUTES } from "@app/routes/routes";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";
import { BillingModal } from "@features/billing/components/viewBillsModal";
import { useUsername } from "@features/users/api/getUsernameById";
import InvoiceTable from "@features/billing/components/InvoiceTable";
import ProjectMetricsCard from "@features/observability/components/ProjectMetricsCard";

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

  // State for the Unified Container Modal (Create/Edit)
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [selectedContainerForEdit, setSelectedContainerForEdit] = useState<Container | null>(null);

  // State for other modals
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [locale] = useState(getLocale());
  const t = translations[locale].projectDetail;

  const id = project?.ownerId || "";
  const ownerUser = useUsername(id);

  /**
   * Logic for Creating a new container
   */
  const handleCreateNew = () => {
    setSelectedContainerForEdit(null); // Explicitly null for "Create" mode
    setIsContainerModalOpen(true);
  };

  /**
   * Logic for quick Env editing (if you still want the separate modal)
   */
  const handleEditEnv = (container: Container) => {
    console.log('handleEditEnv called with container:', container.name);
    setSelectedContainer(container);
    setIsEnvModalOpen(true);
    console.log('isEnvModalOpen set to true');
  };

  const handleSaveEnvVariables = async (containerId: string, envVariables: Record<string, string>) => {
    await updateContainerEnvVariables(containerId, envVariables);
    await reload();
  };

  if (projectLoading) {
    return (
      <section className="h-full">
        <div className="app-container py-8 flex justify-center"><Spinner /></div>
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
            <p className="mt-1 text-sm text-neutral-400">{project.description || t.no_description}</p>
          </div>

          <Button
            size="lg"
            onClick={handleCreateNew}
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
                <span className="font-mono text-sm text-neutral-200">{project.projectId}</span>
              </div>
            </MiniCard>
            <MiniCard title={t.owner}>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-200">{ownerUser.username || "—"}</span>
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
                  <Badge variant="success" className="text-xs">{project.projectStatus}</Badge>
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

        <ProjectMetricsCard
          projectId={project.projectId}
        />

        <SoftPanel>
          <div className="mb-6 flex items-center gap-3">
            <GradientIcon icon={Box} />
            <h2 className="text-lg font-semibold text-neutral-50">
              {t.running_containers} {containers && containers.length > 0 && `(${containers.length})`}
            </h2>
          </div>

          {!containersLoading && !containersError && containers.length > 0 && (
            <div className="space-y-4">
              {containers.map((container) => (
                <ContainerStatusCard
                  key={container.containerId}
                  container={container}
                  onManage={(container) => {
                    setSelectedContainer(container);
                    setIsDetailModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </SoftPanel>

        <div className="space-y-6">
          <InvoiceTable projectId={projectId || ""} />
        </div>
      </div>

      {/* Container Modal - Handles both Create and Edit */}
      <ContainerModal
        isOpen={isContainerModalOpen}
        onClose={() => {
          setIsContainerModalOpen(false);
          setSelectedContainerForEdit(null);
        }}
        projectId={projectId || ""}
        container={selectedContainerForEdit}
        onSuccess={() => reload()}
      />

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        projectId={projectId || ""}
      />

      <EditEnvVariablesModal
        isOpen={isEnvModalOpen}
        onClose={() => {
          setIsEnvModalOpen(false);
          // Don't clear selectedContainer here as ContainerDetailModal is still open
        }}
        container={selectedContainer}
        onSave={handleSaveEnvVariables}
      />

      <ContainerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedContainer(null);
        }}
        container={selectedContainer}
        onEditEnv={handleEditEnv}
      />
    </section>
  );
}
