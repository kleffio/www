import { Link } from "react-router-dom";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";
import { CreateProjectModal } from "@features/projects/components/CreateProjectModal";
import { useProjects } from "@features/projects/hooks/useProjects";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@shared/ui/Table";
import { useState } from "react";

const translations = {
  en: enTranslations,
  fr: frTranslations
};

export function ProjectsPage() {
  const [locale] = useState(getLocale());
  const { projects, isLoading, error, reload } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = translations[locale].projects;
  const tModal = translations[locale].projectModal;
  const handleCreateSuccess = () => {
    void reload();
    setIsModalOpen(false);
  };

  return (
    <section className="h-full" data-testid="projects-page">
      <div className="app-container space-y-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50 md:text-3xl">{t.title}</h1>
            <p className="mt-1 text-sm text-neutral-400">{t.subtitle}</p>
          </div>

          <Button
            size="lg"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-kleff rounded-full px-5 py-2 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
          >
            {tModal.title}
          </Button>
        </header>

        {isLoading && (
          <SoftPanel>
            <div className="flex justify-center py-10">
              <p className="text-sm text-neutral-400">{t.loading}</p>
            </div>
          </SoftPanel>
        )}

        {!isLoading && error && (
          <SoftPanel data-testid="projects-error">
            <p className="py-6 text-sm text-red-400">{error}</p>
          </SoftPanel>
        )}

        {!isLoading && !error && projects.length === 0 && (
          <SoftPanel data-testid="projects-empty">
            <div className="py-10 text-center">
              <p className="text-sm text-neutral-400">{t.no_projects}</p>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-kleff mt-4 rounded-full px-4 py-1.5 text-xs font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
              >
                {t.create_first}
              </Button>
            </div>
          </SoftPanel>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <>
            <div className="hidden md:block" data-testid="projects-list">
              <div className="mx-auto max-w-5xl">
                <SoftPanel className="overflow-hidden px-0 py-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 bg-white/5 hover:bg-white/5">
                        <TableHead>{t.table.name}</TableHead>
                        <TableHead>{t.table.description}</TableHead>
                        <TableHead>{t.table.created_date}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((p) => (
                        <Link
                          key={p.projectId}
                          to={`/dashboard/projects/${p.projectId}`}
                          className="contents"
                        >
                          <TableRow className="cursor-pointer hover:bg-white/10">
                            <TableCell className="font-semibold text-neutral-50">
                              {p.name}
                            </TableCell>
                            <TableCell className="text-neutral-300">
                              {p.description || "—"}
                            </TableCell>
                            <TableCell className="text-neutral-300">
                              {p.createdDate || "—"}
                            </TableCell>
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

                  <p className="text-[11px] text-neutral-300">Created: {p.createdDate || "—"}</p>
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
