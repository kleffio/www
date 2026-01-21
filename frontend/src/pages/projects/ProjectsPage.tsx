import { Link } from "react-router-dom";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";
import { CreateProjectModal } from "@features/projects/components/CreateProjectModal";
import { PendingInvitations } from "@features/projects/components/PendingInvitations";
import { useProjects } from "@features/projects/hooks/useProjects";
import { Button } from "@shared/ui/Button";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Badge } from "@shared/ui/Badge";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import type { Project } from "@features/projects/types/Project";
import { Calendar, Bell, X } from "lucide-react";
import { getMyInvitations } from "@features/projects/api/invitations";

const translations = {
  en: enTranslations,
  fr: frTranslations
};

export function ProjectsPage() {
  const [locale, setLocaleState] = useState(getLocale());
  const { projects, isLoading, error, reload } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const auth = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      const currentLocale = getLocale();
      if (currentLocale !== locale) {
        setLocaleState(currentLocale);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [locale]);

  const t = translations[locale].projects;
  const tModal = translations[locale].projectModal;
  const tNotifications = translations[locale].notifications;

  const currentUserId = auth.user?.profile?.sub;

  useEffect(() => {
    const loadInvitationCount = async () => {
      try {
        const invitations = await getMyInvitations();
        const pendingCount = invitations.filter((inv) => inv.status === "PENDING").length;
        setInvitationCount(pendingCount);
      } catch (error) {
        console.error("Failed to load invitation count:", error);
      }
    };

    loadInvitationCount();

    const interval = setInterval(loadInvitationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void reload();
      }
    };

    const handleFocus = () => {
      void reload();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [reload]);

  const { ownedProjects, collaboratedProjects } = useMemo(() => {
    const owned: Project[] = [];
    const collaborated: Project[] = [];

    projects.forEach((project) => {
      if (project.ownerId === currentUserId) {
        owned.push(project);
      } else {
        collaborated.push(project);
      }
    });

    return { ownedProjects: owned, collaboratedProjects: collaborated };
  }, [projects, currentUserId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleCreateSuccess = () => {
    void reload();
    setIsModalOpen(false);
  };

  return (
    <section className="h-full" data-testid="projects-page">
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-50 md:text-3xl">{t.title}</h1>
            <p className="mt-1 text-sm text-neutral-400">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative rounded-full border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
            >
              <Bell className="h-5 w-5 text-neutral-300" />
              {invitationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {invitationCount > 9 ? "9+" : invitationCount}
                </span>
              )}
            </button>

            <Button
              size="lg"
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-kleff rounded-full px-5 py-2 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
            >
              {tModal.title}
            </Button>
          </div>
        </header>

        {isNotificationOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsNotificationOpen(false)}
          >
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative flex max-h-[85vh] flex-col rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl">
                {/* Header with close button */}
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500/10 p-2">
                      <Bell className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-50">
                        {tNotifications.header_title}
                      </h2>
                      <p className="text-sm text-neutral-400">
                        {invitationCount > 0
                          ? `${invitationCount} ${invitationCount !== 1 ? tNotifications.pending_invitations : tNotifications.pending_invitation}`
                          : tNotifications.no_new_notifications}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="rounded-full p-2 transition-colors hover:bg-white/10"
                  >
                    <X className="h-6 w-6 text-neutral-400 hover:text-neutral-200" />
                  </button>
                </div>

                <div className="overflow-y-auto p-6">
                  <PendingInvitations
                    onUpdate={() => {
                      getMyInvitations().then((invitations) => {
                        const pendingCount = invitations.filter(
                          (inv) => inv.status === "PENDING"
                        ).length;
                        setInvitationCount(pendingCount);
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
          <div className="space-y-8" data-testid="projects-list">
            {/* My Projects Section */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-neutral-50">{t.my_projects}</h2>
                <span className="text-sm text-neutral-400">({ownedProjects.length})</span>
              </div>
              {ownedProjects.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {ownedProjects.map((p) => (
                    <Link
                      key={p.projectId}
                      to={`/dashboard/projects/${p.projectId}`}
                      className="group"
                    >
                      <SoftPanel className="h-full transition-all hover:border-white/20 hover:shadow-lg">
                        <div className="flex h-full min-h-[180px] flex-col">
                          <div className="mb-3 flex items-start justify-between">
                            <Badge variant="secondary" className="text-xs">
                              Owner
                            </Badge>
                          </div>

                          <h3 className="mb-2 text-lg font-semibold text-neutral-50 transition-colors group-hover:text-white">
                            {p.name}
                          </h3>

                          <p className="mb-4 line-clamp-2 flex-grow text-sm text-neutral-400">
                            {p.description || t.no_description}
                          </p>

                          <div className="mt-auto flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(p.createdDate)}</span>
                            </div>
                          </div>
                        </div>
                      </SoftPanel>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Shared with Me Section */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-neutral-50">{t.shared_with_me}</h2>
                <span className="text-sm text-neutral-400">({collaboratedProjects.length})</span>
              </div>
              {collaboratedProjects.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {collaboratedProjects.map((p) => (
                    <Link
                      key={p.projectId}
                      to={`/dashboard/projects/${p.projectId}`}
                      className="group"
                    >
                      <SoftPanel className="h-full transition-all hover:border-white/20 hover:shadow-lg">
                        <div className="flex h-full min-h-[180px] flex-col">
                          <div className="mb-3 flex items-start justify-between">
                            <Badge variant="info" className="text-xs">
                              {t.collaborator_badge}
                            </Badge>
                          </div>

                          <h3 className="mb-2 text-lg font-semibold text-neutral-50 transition-colors group-hover:text-white">
                            {p.name}
                          </h3>

                          <p className="mb-4 line-clamp-2 flex-grow text-sm text-neutral-400">
                            {p.description || t.no_description}
                          </p>

                          <div className="mt-auto flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(p.createdDate)}</span>
                            </div>
                          </div>
                        </div>
                      </SoftPanel>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
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
