import { Sidebar } from "@shared/ui/Sidebar";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Badge } from "@shared/ui/Badge";
import { StatBadge } from "@shared/ui/StatBadge";
import { MiniCard } from "@shared/ui/MiniCard";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Activity, GitBranch, Cpu, Clock, Users, TrendingUp } from "lucide-react";

export function Dashboard() {
  return (
    <div className="bg-kleff-bg relative isolate flex h-screen overflow-hidden">
      {/* Background effects - matching LandingPage exactly */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
        <div className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-white/10 via-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black via-transparent" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Content */}
        <div className="app-container py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-neutral-50">Dashboard</h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Welcome back! Here's what's happening with your projects.
                </p>
              </div>
              <Badge variant="gradient" className="px-3 py-1.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-black/60 mr-2" />
                All Systems Operational
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <MiniCard title="Active Deployments">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">12</span>
                <StatBadge color="green">+3 this week</StatBadge>
              </div>
            </MiniCard>

            <MiniCard title="Total Projects">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">8</span>
                <StatBadge color="white">2 in preview</StatBadge>
              </div>
            </MiniCard>

            <MiniCard title="Uptime">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">99.9%</span>
                <StatBadge color="green">Last 30 days</StatBadge>
              </div>
            </MiniCard>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-neutral-50">Recent Activity</h2>
            <SoftPanel>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-black/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <GradientIcon icon={GitBranch} />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        New deployment: production
                      </div>
                      <div className="text-xs text-neutral-400">main branch • 2 minutes ago</div>
                    </div>
                  </div>
                  <Badge variant="success">Ready</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-black/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <GradientIcon icon={Activity} />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        Project health check completed
                      </div>
                      <div className="text-xs text-neutral-400">api-service • 15 minutes ago</div>
                    </div>
                  </div>
                  <Badge variant="success">Healthy</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-black/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <GradientIcon icon={Cpu} />
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        Resource scaling triggered
                      </div>
                      <div className="text-xs text-neutral-400">
                        frontend-app • 1 hour ago
                      </div>
                    </div>
                  </div>
                  <Badge variant="info">Completed</Badge>
                </div>
              </div>
            </SoftPanel>
          </div>

          {/* Performance Metrics */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-neutral-50">Performance Overview</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <SoftPanel>
                <FeatureRow
                  icon={Clock}
                  title="Average Response Time"
                  description="132ms across all services"
                />
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>12% faster than last week</span>
                </div>
              </SoftPanel>

              <SoftPanel>
                <FeatureRow
                  icon={Activity}
                  title="Error Rate"
                  description="0.04% across all deployments"
                />
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>Well below 1% threshold</span>
                </div>
              </SoftPanel>

              <SoftPanel>
                <FeatureRow
                  icon={Users}
                  title="Active Users"
                  description="2,847 in the last 24 hours"
                />
                <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>+23% growth this month</span>
                </div>
              </SoftPanel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
