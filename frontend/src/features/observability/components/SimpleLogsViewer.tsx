import { useEffect, useState } from 'react';
import { getContainerLogs, type LogEntry } from '../api/getContainerLogs';
import { SoftPanel } from '@shared/ui/SoftPanel';
import { Button } from '@shared/ui/Button';
import { FileText, RefreshCw } from 'lucide-react';

interface SimpleLogsViewerProps {
  projectId: string;
  containerName: string;
}

export default function SimpleLogsViewer({ projectId, containerName }: SimpleLogsViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getContainerLogs(projectId, containerName);
      setLogs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [projectId, containerName]);

  const formatTimestamp = (timestamp: string): string => {
    const ms = parseInt(timestamp) / 1000000;
    const date = new Date(ms);
    return date.toLocaleTimeString();
  };

  if (loading && logs.length === 0) {
    return (
      <SoftPanel>
        <p className="text-sm text-neutral-400 py-8 text-center">Loading logs...</p>
      </SoftPanel>
    );
  }

  if (error) {
    return (
      <SoftPanel>
        <p className="text-sm text-red-400 py-6">{error}</p>
      </SoftPanel>
    );
  }

  return (
    <SoftPanel>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-neutral-50">
            Logs: {containerName}
          </h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/40 p-4">
        <div className="max-h-96 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-center text-neutral-400 py-8">No logs found</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={`${log.timestamp}-${index}`}
                  className="flex gap-2 text-neutral-300"
                >
                  <span className="text-neutral-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span>{log.log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SoftPanel>
  );
}
