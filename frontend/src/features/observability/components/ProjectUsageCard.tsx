import { useEffect, useState } from 'react';
import { getProjectUsageMetrics } from '../api/getProjectUsageMetrics';
import type { ProjectUsageMetrics } from '../types/projectUsageMetrics.types';
import { SoftPanel } from '@shared/ui/SoftPanel';
import { MiniCard } from '@shared/ui/MiniCard';
import { GradientIcon } from '@shared/ui/GradientIcon';
import { Cpu, HardDrive, Clock } from 'lucide-react';

interface ProjectUsageCardProps {
  projectId: string;
}

export default function ProjectUsageCard({ projectId }: ProjectUsageCardProps) {
  const [usageMetrics, setUsageMetrics] = useState<ProjectUsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectUsageMetrics(projectId);
      setUsageMetrics(data);
    } catch (err) {
      setError('Unable to retrieve usage metrics. Please check your connection.');
      console.error('Error fetching project usage metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageMetrics();
    // Refresh every 5 minutes since these are 30-day averages
    const interval = setInterval(fetchUsageMetrics, 300000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading && !usageMetrics) {
    return (
      <SoftPanel>
        <div className="flex justify-center py-10">
          <p className="text-sm text-neutral-400">Loading usage metrics...</p>
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

  if (!usageMetrics) return null;

  return (
    <SoftPanel>
      <div className="mb-6 flex items-center gap-3">
        <GradientIcon icon={Clock} />
        <h2 className="text-lg font-semibold text-neutral-50">30-Day Usage Averages</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MiniCard title="Average Memory Usage">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-neutral-400" />
            <span className="text-2xl font-semibold text-neutral-50">
              {usageMetrics.memoryUsageGB.toFixed(2)}
            </span>
            <span className="text-xs text-neutral-400">GB</span>
          </div>
        </MiniCard>

        <MiniCard title="Average CPU Requests">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-neutral-400" />
            <span className="text-2xl font-semibold text-neutral-50">
              {usageMetrics.cpuRequestCores.toFixed(3)}
            </span>
            <span className="text-xs text-neutral-400">cores</span>
          </div>
        </MiniCard>

        <MiniCard title="Time Window">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-50">
              {usageMetrics.window}
            </span>
          </div>
        </MiniCard>
      </div>
    </SoftPanel>
  );
}
