import { useEffect, useState } from 'react';
import { getProjectMetrics } from '../api/getProjectMetrics';
import type { ProjectMetrics } from '../types/projectMetrics.types';

interface ProjectMetricsCardProps {
  projectId: string;
  containerNames: string[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function ProjectMetricsCard({ projectId, containerNames }: ProjectMetricsCardProps) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getProjectMetrics(projectId, containerNames);
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return <div className="p-4">Loading metrics...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Project Metrics & Billing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Monthly Cost</p>
          <p className="text-2xl font-bold text-blue-600">
            ${metrics.estimatedMonthlyCost.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">CPU Usage</p>
          <p className="text-2xl font-bold text-green-600">
            {metrics.totalCpuCores.toFixed(3)} cores
          </p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Memory</p>
          <p className="text-2xl font-bold text-purple-600">
            {metrics.totalMemoryGb.toFixed(2)} GB
          </p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Containers</p>
          <p className="text-2xl font-bold text-orange-600">
            {metrics.runningContainers}/{metrics.totalContainers}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Container Details</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-4">Container</th>
              <th className="text-right py-2 px-4">CPU</th>
              <th className="text-right py-2 px-4">Memory</th>
              <th className="text-right py-2 px-4">Network</th>
              <th className="text-right py-2 px-4">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {metrics.containers.map(container => (
              <tr key={container.containerName} className="border-b border-gray-100">
                <td className="py-2 px-4 font-medium">{container.containerName}</td>
                <td className="py-2 px-4 text-right text-sm">
                  {container.cpuUsageCores.toFixed(3)} cores
                </td>
                <td className="py-2 px-4 text-right text-sm">
                  {formatBytes(container.memoryUsageBytes)}
                </td>
                <td className="py-2 px-4 text-right text-sm">
                  <div>↓ {formatBytes(container.networkRxBytes)}</div>
                  <div>↑ {formatBytes(container.networkTxBytes)}</div>
                </td>
                <td className="py-2 px-4 text-right text-sm">
                  {formatUptime(container.uptimeSeconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}