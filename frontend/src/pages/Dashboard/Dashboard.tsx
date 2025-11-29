import { Link } from "react-router-dom";
import { Sidebar } from "@shared/ui/Sidebar";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Badge } from "@shared/ui/Badge";
import { StatBadge } from "@shared/ui/StatBadge";
import { MiniCard } from "@shared/ui/MiniCard";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Button } from "@shared/ui/Button";
import {
  Activity,
  GitBranch,
  Cpu,
  Globe,
  Shield,
  Zap,
  HardDrive,
  TrendingUp,
  ArrowUpRight,
  Lock,
  Server,
  BarChart3
} from "lucide-react";

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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-neutral-50">Overview</h1>
                <p className="mt-1 text-sm text-neutral-400">
                  Monitor your deployments, traffic, and infrastructure health
                </p>
              </div>
              <Link to="/deploy-new-project">
                <Button
                  size="lg"
                  className="bg-gradient-kleff rounded-full px-6 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
                >
                  Deploy New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniCard title="Requests (24h)">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">2.4M</span>
                <StatBadge color="green">+12.3%</StatBadge>
              </div>
            </MiniCard>

            <MiniCard title="Bandwidth">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">847 GB</span>
                <StatBadge color="green">+8.1%</StatBadge>
              </div>
            </MiniCard>

            <MiniCard title="Active Deployments">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">12</span>
                <StatBadge color="white">8 regions</StatBadge>
              </div>
            </MiniCard>

            <MiniCard title="Uptime (30d)">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-neutral-50">99.98%</span>
                <StatBadge color="green">Excellent</StatBadge>
              </div>
            </MiniCard>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Takes 2 columns */}
            <div className="space-y-6 lg:col-span-2">
              {/* Traffic Analytics */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-50">Traffic & Performance</h2>
                  <Button
                    variant="ghost"
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    View Analytics <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <SoftPanel>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Globe className="h-4 w-4" />
                        <span>Total Requests</span>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-neutral-50">2,487,392</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                          <TrendingUp className="h-3 w-3" />
                          <span>+12.3% from yesterday</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <Zap className="h-4 w-4" />
                        <span>Avg Response Time</span>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-neutral-50">94ms</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                          <TrendingUp className="h-3 w-3" />
                          <span>18ms faster</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <HardDrive className="h-4 w-4" />
                        <span>Cache Hit Rate</span>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-neutral-50">94.2%</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                          <span>Optimal performance</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-32 rounded-lg bg-black/40 p-4">
                    <div className="flex h-full items-end justify-between gap-1">
                      {[65, 78, 82, 71, 88, 92, 85, 79, 95, 100, 97, 89].map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-kleff flex-1 rounded-t opacity-80"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </SoftPanel>
              </div>

              {/* Recent Deployments */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-50">Recent Deployments</h2>
                  <Button
                    variant="ghost"
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    View All <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <SoftPanel>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-black/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <GradientIcon icon={GitBranch} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-200">
                              production
                            </span>
                            <span className="font-mono text-xs text-neutral-500">•</span>
                            <span className="font-mono text-xs text-neutral-400">a3f8d2c</span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            feat: add user authentication • 2 minutes ago
                          </div>
                        </div>
                      </div>
                      <Badge variant="success">Deployed</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-black/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <GradientIcon icon={GitBranch} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-200">staging</span>
                            <span className="font-mono text-xs text-neutral-500">•</span>
                            <span className="font-mono text-xs text-neutral-400">b7e4f91</span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            fix: resolve API timeout issues • 18 minutes ago
                          </div>
                        </div>
                      </div>
                      <Badge variant="warning">Building</Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-black/40 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <GradientIcon icon={GitBranch} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-200">preview</span>
                            <span className="font-mono text-xs text-neutral-500">•</span>
                            <span className="font-mono text-xs text-neutral-400">c9d2a5e</span>
                          </div>
                          <div className="text-xs text-neutral-400">
                            chore: update dependencies • 1 hour ago
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                  </div>
                </SoftPanel>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security Status */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Security</h2>
                <SoftPanel>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                          <Shield className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-200">SSL/TLS</div>
                          <div className="text-xs text-neutral-400">Active</div>
                        </div>
                      </div>
                      <Badge variant="success">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                          <Lock className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-200">DDoS Protection</div>
                          <div className="text-xs text-neutral-400">Under attack mode off</div>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                      <div className="text-xs text-emerald-200">
                        <div className="font-medium">24h Security Summary</div>
                        <div className="mt-1 text-emerald-300/80">
                          847 threats blocked • 0 incidents
                        </div>
                      </div>
                    </div>
                  </div>
                </SoftPanel>
              </div>

              {/* Infrastructure */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Infrastructure</h2>
                <SoftPanel>
                  <div className="space-y-3">
                    <FeatureRow
                      icon={Server}
                      title="Active Regions"
                      description="8 edge locations worldwide"
                    />
                    <FeatureRow
                      icon={Cpu}
                      title="Compute Usage"
                      description="67% capacity • 2.4K vCPU hours"
                    />
                    <FeatureRow
                      icon={HardDrive}
                      title="Storage"
                      description="124 GB used of 500 GB"
                    />
                    <FeatureRow
                      icon={BarChart3}
                      title="DNS Queries"
                      description="1.2M queries in last 24h"
                    />
                  </div>
                </SoftPanel>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-neutral-50">Quick Actions</h2>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/20 bg-white/5 text-sm text-neutral-200 hover:border-white/40 hover:bg-white/10"
                  >
                    <GitBranch className="h-4 w-4" />
                    Create New Deployment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/20 bg-white/5 text-sm text-neutral-200 hover:border-white/40 hover:bg-white/10"
                  >
                    <Activity className="h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/20 bg-white/5 text-sm text-neutral-200 hover:border-white/40 hover:bg-white/10"
                  >
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
