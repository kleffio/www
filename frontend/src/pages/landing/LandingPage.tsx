import { Link } from "react-router-dom";
import { Button } from "@shared/ui/Button";
import { Badge } from "@shared/ui/Badge";
import { Section, SectionHeader } from "@shared/ui/Section";
import { GradientIcon } from "@shared/ui/GradientIcon";

import { Activity, Boxes, Cpu, GitBranch, Shield, SignalHigh, Timer, Workflow } from "lucide-react";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { MiniCard } from "@shared/ui/MiniCard";
import { KleffDot } from "@shared/ui/KleffDot";

export function LandingPage() {
  return (
    <div className="bg-kleff-bg relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
        <div className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-white/10 via-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black via-transparent" />

      <Section className="flex flex-col items-center gap-12 pt-20 pb-16 text-center lg:flex-row lg:items-start lg:py-24 lg:text-left">
        <div className="max-w-xl flex-1 space-y-7">
          <div className="inline-flex flex-wrap items-center gap-2">
            <Badge
              variant="gradient"
              className="flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
            >
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-black/60" />
              <span>Open-source hosting platform</span>
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-white/20 px-3 py-1 text-[11px] font-medium text-neutral-200"
            >
              Self-hosted or fully managed
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Deploy in minutes,
              <br className="hidden sm:block" />
              <span className="text-gradient-kleff">scale without lock-in.</span>
            </h1>
            <p className="text-sm text-neutral-300 sm:text-base">
              Kleff is an open-source hosting platform for modern teams. From a single service to
              fleets of applications, ship with Vercel-level DX while keeping full control over your
              infrastructure.
            </p>
          </div>

          <div className="grid gap-3 text-left text-[11px] text-neutral-300 sm:grid-cols-3">
            <MiniCard
              title="Git push deploys"
              description="Connect GitHub, GitLab, or your own registry."
            />
            <MiniCard
              title="Self-hosted first"
              description="Run Kleff on your own hardware or use our cloud."
            />
            <MiniCard
              title="Batteries included"
              description="Identity, observability, networking, and automation."
            />
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:items-center">
            <Link to="/auth/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-gradient-kleff w-full rounded-full px-8 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110"
              >
                Get started for free
              </Button>
            </Link>
            <Link to="/docs" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full border-white/20 bg-white/5 text-sm font-semibold text-neutral-100 hover:border-white/40 hover:bg-white/10"
              >
                View docs
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 text-[11px] text-neutral-500 sm:justify-start">
            <span className="font-medium text-neutral-400">Trusted by teams running:</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.15em] text-neutral-400 uppercase">
              Next.js
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.15em] text-neutral-400 uppercase">
              Go APIs
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-[0.15em] text-neutral-400 uppercase">
              Microservices
            </span>
          </div>
        </div>

        <div className="max-w-lg flex-1">
          <div className="glass-panel relative mx-auto max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                <span>deploys.kleff.io</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300">
                <KleffDot size={16} />

                <span>Preview</span>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:grid-cols-5">
              <div className="space-y-3 sm:col-span-3">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-medium text-neutral-200">Recent deploys</span>
                  <span>main • Production</span>
                </div>

                <div className="space-y-2 font-mono text-[11px] text-neutral-300">
                  <div className="flex items-center justify-between rounded-lg bg-black/60 px-3 py-2">
                    <span>git push origin main</span>
                    <span className="text-emerald-400">● Ready</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <span>feat/observability-dashboard</span>
                    <span className="text-amber-300">● Building</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2">
                    <span>chore/update-runtime</span>
                    <span className="text-neutral-500">● Queued</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[10px] text-neutral-400">
                  <div>
                    <span className="font-semibold text-neutral-100">132ms</span>{" "}
                    <span className="ml-0.5">P95 latency</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-100">0.04%</span>{" "}
                    <span className="ml-0.5">Error rate</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-100">3</span>{" "}
                    <span className="ml-0.5">Active regions</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:col-span-2">
                <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-neutral-200">Regions</span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                      Healthy
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-neutral-300">
                    <div className="flex items-center justify-between">
                      <span>iad1 • US-East</span>
                      <span className="text-emerald-400">●</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>fra1 • EU-Central</span>
                      <span className="text-emerald-400">●</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>yul1 • CA-East</span>
                      <span className="text-emerald-400">●</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] text-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Deploy preview created</span>
                    <span className="text-[10px] text-amber-200">#241</span>
                  </div>
                  <p className="mt-2 text-[10px] text-amber-100/90">
                    Share this URL with your team to review changes before promoting to production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-14">
        <SoftPanel>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Why teams choose Kleff
              </h2>
              <p className="mt-2 text-sm text-neutral-200">
                Everything you need to go from <span className="font-mono">git push</span> to
                observable production.
              </p>
            </div>
            <p className="max-w-sm text-xs text-neutral-400">
              Kleff&apos;s core is open source. Run it on your own machines or use our managed
              offering — the workflow stays the same.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <FeatureRow
              icon={(props) => <GradientIcon icon={SignalHigh} {...props} />}
              title="Fast from day one"
              description="Zero-config deploys, preview environments, and instant rollbacks — without drowning in YAML."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Boxes} {...props} />}
              title="Open by default"
              description="Inspect the code, contribute features, and run the same stack locally, on-prem, or in any cloud."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Activity} {...props} />}
              title="Visibility first"
              description="Logs, metrics, and alerts that actually make sense. Plug into Prometheus/Grafana or use built-in dashboards."
            />
          </div>
        </SoftPanel>
      </Section>

      <Section className="pb-16">
        <SectionHeader
          label="Kleff platform"
          title="A complete toolkit for modern services."
          description="Mix and match the pieces you need: deployments, identity, observability, data, and automation — all with sane defaults and self-hostable control."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <SoftPanel>
            <div className="flex items-center gap-3 pb-2">
              <GradientIcon icon={GitBranch} />
              <div>
                <div className="text-sm font-semibold text-neutral-50">Deployments</div>
                <div className="text-xs text-neutral-400">
                  Build and ship containers with zero-config pipelines.
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] text-neutral-400">
              <FeatureRow
                icon={Timer}
                title="Preview environments"
                description="One per pull request, automatically."
              />
              <FeatureRow
                icon={SignalHigh}
                title="Safe rollbacks"
                description="Instantly revert to a known-good deploy."
              />
            </div>
          </SoftPanel>

          <SoftPanel>
            <div className="flex items-center gap-3 pb-2">
              <GradientIcon icon={Shield} />
              <div>
                <div className="text-sm font-semibold text-neutral-50">Identity & Access</div>
                <div className="text-xs text-neutral-400">Bring Kleff Auth or your own IDP.</div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] text-neutral-400">
              <FeatureRow
                icon={Boxes}
                title="Multi-tenant aware"
                description="Org & project boundaries modeled correctly."
              />
              <FeatureRow
                icon={Workflow}
                title="Audit-friendly"
                description="Sessions, tokens, and key changes tracked."
              />
            </div>
          </SoftPanel>

          <SoftPanel>
            <div className="flex items-center gap-3 pb-2">
              <GradientIcon icon={Cpu} />
              <div>
                <div className="text-sm font-semibold text-neutral-50">Observability</div>
                <div className="text-xs text-neutral-400">
                  Centralized logs, metrics, and alerts.
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-[11px] text-neutral-400">
              <FeatureRow
                icon={Activity}
                title="Dashboards"
                description="See health across services at a glance."
              />
              <FeatureRow
                icon={Workflow}
                title="Integrations"
                description="Prometheus / Grafana friendly from day one."
              />
            </div>
          </SoftPanel>
        </div>
      </Section>

      <Section className="pb-20">
        <div className="glass-panel flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:py-9 sm:text-left">
          <div className="max-w-xl space-y-2">
            <h2 className="text-xl font-semibold text-neutral-50 sm:text-2xl">
              Start building on Kleff in minutes.
            </h2>
            <p className="text-sm text-neutral-400">
              Ship your next project with an open platform you can run anywhere. Explore templates,
              example repos, and the full Kleff stack on GitHub.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/templates">
              <Button
                size="lg"
                className="bg-gradient-kleff w-full rounded-full px-7 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 sm:w-auto"
              >
                View starter templates
              </Button>
            </Link>
            <Link to="/examples">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full border-white/20 bg-white/5 text-sm font-semibold text-neutral-100 hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Browse GitHub examples
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
