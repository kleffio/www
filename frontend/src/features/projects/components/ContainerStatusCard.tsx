import React from "react";
import { Button } from "@shared/ui/Button";
import { Badge } from "@shared/ui/Badge";
import { Box, ExternalLink } from "lucide-react";
import type { Container } from "@features/projects/types/Container";

interface ContainerStatusCardProps {
  container: Container;
  onManage: (container: Container) => void;
}

export function ContainerStatusCard({ container, onManage }: ContainerStatusCardProps) {
  const appUrl = `https://${container.containerId}.kleff.io`;

  const handleVisitApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(appUrl, '_blank');
  };

  const handleCardClick = () => {
    onManage(container);
  };

  return (
    <button
      onClick={handleCardClick}
      className="grid w-full grid-cols-[1fr_auto_120px] items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors cursor-pointer"
    >
      {/* Left side: Icon + Container Name */}
      <div className="flex items-center gap-3">
        <Box className="h-5 w-5 text-blue-400" />
        <span className="font-semibold text-neutral-50">{container.name}</span>
      </div>

      {/* Center: Status Badge */}
      <Badge
        variant={
          container.status?.toLowerCase().includes("running")
            ? "success"
            : container.status?.toLowerCase().includes("stopped")
              ? "secondary"
              : "warning"
        }
        className="text-xs justify-self-center"
      >
        {container.status || "Unknown"}
      </Badge>

      {/* Right side: Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleVisitApp}
          className="h-8 px-3 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          Visit App
        </Button>
      </div>
    </button>
  );
}
