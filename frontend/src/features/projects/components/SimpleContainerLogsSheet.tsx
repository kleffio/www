import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@shared/ui/Sheet';
import type { Container } from '@features/projects/types/Container';
import SimpleLogsViewer from '@features/observability/components/SimpleLogsViewer';

interface SimpleContainerLogsSheetProps {
  container: Container | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SimpleContainerLogsSheet({
  container,
  projectId,
  open,
  onOpenChange,
}: SimpleContainerLogsSheetProps) {
  if (!container) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl bg-neutral-950/95 backdrop-blur-xl border-white/10 overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-neutral-50">
            {container.name}
          </SheetTitle>
        </SheetHeader>

        <SimpleLogsViewer
          projectId={projectId}
          containerName={container.name}
        />
      </SheetContent>
    </Sheet>
  );
}
