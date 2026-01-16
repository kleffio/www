import React from "react";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Button } from "@shared/ui/Button";
import { Badge } from "@shared/ui/Badge";
import { MiniCard } from "@shared/ui/MiniCard";
import { X, ExternalLink, Settings, Hash, Box, Code, GitBranch, Calendar, Server, Copy, Play, Square, Trash2 } from "lucide-react";
import { formatRepoUrl, formatTimeAgo, formatPort } from "@shared/lib/utils";
import type { Container } from "@features/projects/types/Container";
import enTranslations from "@app/locales/en/projects.json";
import frTranslations from "@app/locales/fr/projects.json";
import { getLocale } from "@app/locales/locale";

interface ContainerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container | null;
  onEditEnv?: (container: Container) => void;
}

export function ContainerDetailModal({ isOpen, onClose, container, onEditEnv }: ContainerDetailModalProps) {
  const [copiedId, setCopiedId] = React.useState(false);

  if (!isOpen || !container) return null;

  const appUrl = `https://${container.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.kleff.io`;

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

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
                  {container.status || "Unknown"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => window.open(appUrl, '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit App
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

          {/* Two Column Body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Source */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Source</h3>
                <div className="space-y-4">
                  {/* Repository URL */}
                  <MiniCard title="Repository">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-neutral-400" />
                      {(() => {
                        const repo = formatRepoUrl(container.repoUrl);
                        return repo.link ? (
                          <a
                            href={repo.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          >
                            {repo.display}
                          </a>
                        ) : (
                          <span className="text-sm text-neutral-400">{repo.display}</span>
                        );
                      })()}
                    </div>
                  </MiniCard>

                  {/* Branch */}
                  <MiniCard title="Branch">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-neutral-200">{container.branch || "Not specified"}</span>
                    </div>
                  </MiniCard>
                </div>
              </div>
            </div>

            {/* Right Column - Runtime */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">Runtime</h3>
                <div className="space-y-4">
                  {/* Internal Ports */}
                  <MiniCard title="Internal Ports">
                    <div className="flex items-center gap-2">
                      {container.ports.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {container.ports.map((port, index) => (
                            <span key={index} className="text-sm text-neutral-200">
                              {formatPort(port)}
                              {index < container.ports.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">No ports configured</span>
                      )}
                    </div>
                  </MiniCard>

                  {/* Deployment Date */}
                  <MiniCard title="Deployment Date">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-neutral-200">{formatTimeAgo(container.createdAt)}</span>
                    </div>
                  </MiniCard>

                  {/* Uptime - For now, just show deployment time. In a real app, this would calculate actual uptime */}
                  <MiniCard title="Uptime">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm text-neutral-200">{formatTimeAgo(container.createdAt)}</span>
                    </div>
                  </MiniCard>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Variables Section - Full Width */}
          {container.envVariables && Object.keys(container.envVariables).length > 0 && (
            <div className="mt-8 bg-slate-900/60 rounded-lg p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Environment Variables</h3>
                {onEditEnv && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditEnv(container)}
                    className="border-slate-600 bg-slate-700 text-xs text-slate-300 hover:border-slate-500 hover:bg-slate-600"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Edit Variables
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
                Restart
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
              {onEditEnv && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Edit Environment Variables button clicked');
                    onEditEnv(container);
                  }}
                  className="border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Environment Variables
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </SoftPanel>
      </section>
    </section>
  );
}
