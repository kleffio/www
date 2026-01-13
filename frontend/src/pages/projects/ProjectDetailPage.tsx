import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@shared/ui/Table";
import { Spinner } from "@shared/ui/Spinner";
import { MiniCard } from "@shared/ui/MiniCard";
import { Badge } from "@shared/ui/Badge";
import { Hash, User, Layers, Activity, Calendar, Clock, Box, Settings, ExternalLink } from "lucide-react";
import { useProject } from "@features/projects/hooks/useProject";
import { useProjectContainers } from "@features/projects/hooks/useProjectContainers";
import { ContainerModal } from "@features/projects/components/CreateContainerModal";
import { EditEnvVariablesModal } from "@features/projects/components/EditEnvVariablesModal";
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

const sanitizeAppName = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  const [selectedContainerForEnv, setSelectedContainerForEnv] = useState<Container | null>(null);
  
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
   * Logic for Editing an existing container
   */
  const handleEditContainer = (container: Container) => {
    setSelectedContainerForEdit(container); // Pass the container object for "Edit" mode
    setIsContainerModalOpen(true);
  };

  /**
   * Logic for quick Env editing (if you still want the separate modal)
   */
  const handleEditEnv = (container: Container) => {
    setSelectedContainerForEnv(container);
    setIsEnvModalOpen(true);
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

  const containerNames = !containersLoading && containers?.map(c => c.name).filter(Boolean) || [];

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

        {!containersLoading && containerNames.length > 0 && (
          <ProjectMetricsCard 
            projectId={project.projectId}
            containerNames={containerNames}
          />
        )}

           
<SoftPanel>
  <div className="mb-6 flex items-center gap-3">
    <Box className="h-5 w-5 text-neutral-400" />
    <h2 className="text-lg font-semibold text-neutral-50">{t.running_containers}</h2>
    {containers && containers.length > 0 && (
      <Badge variant="info" className="text-xs">
        {containers.length} {containers.length === 1 ? t.container : t.containers}
      </Badge>
    )}
  </div>

  {/* 1. Show Spinner while loading */}
  {containersLoading && (
    <div className="flex justify-center py-10">
      <Spinner />
    </div>
  )}

  {/* 2. Show Table if containers exist */}
  {!containersLoading && !containersError && containers.length > 0 && (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
          <TableHead>{t.table.name}</TableHead>
          <TableHead>{t.table.status}</TableHead>
          <TableHead>App URL</TableHead>
          <TableHead>{t.table.image}</TableHead>
          <TableHead>{t.table.ports}</TableHead>
          <TableHead>Repository</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {containers.map((container) => {
          const appUrl = `https://${sanitizeAppName(container.name)}.kleff.io`;
          return (
            <TableRow key={container.containerId} className="hover:bg-white/5">
              <TableCell className="font-semibold text-neutral-50">{container.name}</TableCell>
              <TableCell>
                <Badge variant={container.status?.toLowerCase().includes("running") ? "success" : "secondary"} className="text-xs">
                  {container.status || t.unknown}
                </Badge>
              </TableCell>
              <TableCell>
                <a href={appUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300">
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell className="font-mono text-xs text-neutral-300 truncate max-w-[150px]">{container.image}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {container.ports?.map((port, i) => (
                    <Badge key={i} variant="outline" className="px-1.5 py-0.5 text-[10px]">{port}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-neutral-300 truncate max-w-[100px]">{container.repoUrl || "—"}</TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                   <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditContainer(container)}
                    className="rounded-full px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditEnv(container)}
                    className="rounded-full px-3 py-1.5 text-xs"
                  >
                    Env
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )}

  {/* 3. EMPTY STATE: Show if not loading and no containers found */}
  {!containersLoading && !containersError && containers.length === 0 && (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-white/5 p-6">
        <Box className="h-10 w-10 text-neutral-500 opacity-50" />
      </div>
      <h3 className="text-lg font-medium text-neutral-200">
        {t.no_containers}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-neutral-400">
        {t.no_containers_description || "This project doesn't have any containers yet. Create one to get started."}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateNew}
        className="mt-6 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
      >
        {t.create_first_container || "Deploy your first container"}
      </Button>
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
          setSelectedContainerForEnv(null);
        }}
        container={selectedContainerForEnv}
        onSave={handleSaveEnvVariables}
      />
    </section>
  );
}
