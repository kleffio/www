import { useEffect, useState } from 'react';
import { getProjectMetrics } from '../api/getProjectMetrics';
import type { ProjectMetrics } from '../types/projectMetrics.types';
import { SoftPanel } from '@shared/ui/SoftPanel';
import { MiniCard } from '@shared/ui/MiniCard';
import { GradientIcon } from '@shared/ui/GradientIcon';
import { DollarSign, Cpu, HardDrive, Activity } from 'lucide-react';

interface ProjectMetricsCardProps {
  projectId: string;
  containerNames: string[];
}

export default function ProjectMetricsCard({ projectId, containerNames }: ProjectMetricsCardProps) {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectMetrics(projectId, containerNames);
      setMetrics(data);
    } catch (err) {
      setError('Unable to retrieve project metrics. Please verify Prometheus is configured.');
      console.error('Error fetching project metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [projectId, containerNames]);

  if (loading && !metrics) {
    return (
      <SoftPanel>
        <div className="flex justify-center py-10">
          <p className="text-sm text-neutral-400">Loading metrics...</p>
        </div>
      </SoftPanel>
    );
  }

  if (error) {
    return (
      <SoftPanel>
        <p className="py-6 text-sm text-red-400">{error}</p>
      </SoftPanel>
    );
  }

  if (!metrics) return null;

  return (
    <SoftPanel>
      <div className="mb-6 flex items-center gap-3">
        <GradientIcon icon={DollarSign} />
        <h2 className="text-lg font-semibold text-neutral-50">Project Metrics & Billing</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniCard title="Estimated Monthly Cost">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-neutral-400" />
            <span className="text-2xl font-semibold text-neutral-50">
              ${(metrics.estimatedMonthlyCost || 0).toFixed(2)}
            </span>
          </div>
        </MiniCard>

        <MiniCard title="Total CPU Usage">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-neutral-400" />
            <span className="text-2xl font-semibold text-neutral-50">
              {(metrics.totalCpuCores || 0).toFixed(3)}
            </span>
            <span className="text-xs text-neutral-400">cores</span>
          </div>
        </MiniCard>

        <MiniCard title="Total Memory">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-neutral-400" />
            <span className="text-2xl font-semibold text-neutral-50">
              {(metrics.totalMemoryGb || 0).toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400">GB</span>
          </div>
        </MiniCard>

        <MiniCard title="Container Status">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-neutral-400" />
            <span className="text-2xl font-semibold text-neutral-50">
              {metrics.runningContainers || 0}
            </span>
            <span className="text-xs text-neutral-400">
              / {metrics.totalContainers || 0} running
            </span>
          </div>
        </MiniCard>
      </div>
    </SoftPanel>
  );
}
