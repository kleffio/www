import React from "react";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Button } from "@shared/ui/Button";
import { Badge } from "@shared/ui/Badge";
import { X, ExternalLink, Settings, Hash, Box, Code, GitBranch, Copy, Play, Square, Trash2, Network, Edit } from "lucide-react";
import { formatRepoUrl, formatPort } from "@shared/lib/utils";
import type { Container } from "@features/projects/types/Container";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";

const translations = {
  en: enTranslations,
  fr: frTranslations
};

interface ContainerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container | null;
  onEditEnv?: (container: Container) => void;
  onEditContainer?: (container: Container) => void;
}

export function ContainerDetailModal({ isOpen, onClose, container, onEditEnv, onEditContainer }: ContainerDetailModalProps) {
  const [copiedId, setCopiedId] = React.useState(false);
  const [locale] = React.useState(getLocale());
  const t = translations[locale].projectDetail.containerDetail;

  if (!isOpen || !container) return null;

  const appUrl = `https://${container.containerId}.kleff.io`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(container.containerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error('Failed to copy container ID:', err);
    }
  };

  const truncateId = (id: string) => {
    if (id.length <= 20) return id;
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <section className="relative z-10 w-full max-w-4xl px-4 sm:px-0 max-h-[90vh] overflow-y-auto">
        <SoftPanel className="border border-white/10 bg-black/70 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Box className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">{container.name}</h2>
                <Badge
                  variant={
                    container.status?.toLowerCase().includes("running")
                      ? "success"
                      : container.status?.toLowerCase().includes("stopped")
                        ? "secondary"
                        : "warning"
                  }
                  className="mt-1 text-xs"
                >
                  {container.status?.toLowerCase().includes("running") && (
                    <span className="relative mr-1.5 inline-flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                  )}
                  {container.status || t.unknown}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(appUrl, '_blank')}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t.visit_app}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-neutral-400 transition hover:border-white/30 hover:bg-white/10 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t.details}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Container ID */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <Hash className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-neutral-100">{t.container_id}</div>
                  <button
                    onClick={handleCopyId}
                    className="font-mono text-sm text-neutral-200 hover:text-blue-400 transition-colors truncate flex items-center gap-1 group"
                    title="Click to copy"
                    data-container-id={container.containerId}
                  >
                    {truncateId(container.containerId)}
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  {copiedId && (
                    <span className="text-xs text-emerald-400 animate-pulse">{t.copied}</span>
                  )}
                </div>
              </div>

              {/* Ports */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <Network className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-neutral-100">{t.ports}</div>
                  <div className="font-mono text-sm text-neutral-200 truncate">
                    {container.ports.length > 0 ? (
                      container.ports.map((port, index) => (
                        <span key={index}>
                          {formatPort(port)}
                          {index < container.ports.length - 1 && ", "}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-400">{t.none}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <GitBranch className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-neutral-100">{t.branch}</div>
                  <div className="font-mono text-sm text-neutral-200 truncate">
                    {container.branch || t.main}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Source Code Section */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-white">{t.source_code}</h3>
            <div
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-colors"
              onClick={() => {
                const repo = formatRepoUrl(container.repoUrl);
                if (repo.link) window.open(repo.link, '_blank');
              }}
            >
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium text-neutral-100">
                    {(() => {
                      const repo = formatRepoUrl(container.repoUrl);
                      return repo.display;
                    })()}
                  </div>
                  <div className="text-sm text-neutral-400">{t.click_to_open_repo}</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-neutral-400" />
            </div>
          </div>

          {/* Environment Variables Section - Full Width */}
          {container.envVariables && Object.keys(container.envVariables).length > 0 && (
            <div className="mt-8 bg-slate-900/60 rounded-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t.environment_variables}</h3>
                {onEditEnv && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditEnv(container)}
                    className="border-slate-600 bg-slate-700 text-xs text-slate-300 hover:border-slate-500 hover:bg-slate-600"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    {t.edit_variables}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {Object.entries(container.envVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 rounded border border-slate-700 bg-slate-800/60 p-3">
                    <span className="font-mono text-sm font-semibold text-slate-300 min-w-0 flex-1">{key}</span>
                    <span className="text-sm text-slate-500">=</span>
                    <span className="font-mono text-sm text-white min-w-0 flex-1 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer - Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex flex-wrap gap-3 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
              >
                <Play className="mr-2 h-4 w-4" />
                {t.restart}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
              >
                <Square className="mr-2 h-4 w-4" />
                {t.stop}
              </Button>
              {onEditContainer && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditContainer(container)}
                  className="border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t.edit_container}
                </Button>
              )}
              {onEditEnv && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditEnv(container)}
                  className="border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t.edit_environment_variables}
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t.delete}
              </Button>
            </div>
          </div>
        </SoftPanel>
      </section>
    </section>
  );
}
