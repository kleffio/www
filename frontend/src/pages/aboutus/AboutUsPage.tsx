import { ArrowRight, Check, GitBranch, Activity, Shield } from "lucide-react";
import { Section, SectionHeader } from "@shared/ui/Section";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Badge } from "@shared/ui/Badge";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { DollarSign, Globe, Zap, Cpu } from "lucide-react";
import { MiniCard } from "@shared/ui/MiniCard";

export function AboutUsPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <Section className="flex flex-col items-center gap-12 pt-20 pb-16 text-center">
        <div className="max-w-3xl space-y-6">
          <Badge
            variant="gradient"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
          >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-black/60" />
            <span>Built with passion in Canada</span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Kleff empowers developers
              <br />
              <span className="text-gradient-kleff">to build without limits.</span>
            </h1>
            <p className="text-sm text-neutral-300 sm:text-base">
              We're making enterprise-grade cloud hosting accessible to everyone—with transparent pricing, Canadian infrastructure, and developer-first tools.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="glass-panel p-8 text-center sm:p-12">
            <p className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
              We believe{" "}
              <span className="text-gradient-kleff">powerful cloud hosting</span>{" "}
              shouldn't break the bank or sacrifice developer experience.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <SectionHeader
          label="Why Kleff"
          title="What sets us apart"
          description="Built by developers, for developers, with a focus on simplicity and transparency."
        />
        <div className="glass-panel-soft p-6">
          <div className="grid gap-3 md:grid-cols-4">
            <FeatureRow
              icon={(props) => <GradientIcon icon={DollarSign} {...props} />}
              title="Transparent Pricing"
              description="No hidden fees. Pay only for what you use."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Globe} {...props} />}
              title="Proudly Canadian"
              description="Your data stays in Canada. Always."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Zap} {...props} />}
              title="Lightning Fast"
              description="Deploy in seconds. Scale instantly."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Shield} {...props} />}
              title="Enterprise Security"
              description="SOC 2 compliant. PIPEDA certified."
            />
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="glass-panel-soft p-8">
          <div className="grid gap-12 text-center md:grid-cols-3">
            <div>
              <div className="text-gradient-kleff mb-2 text-5xl font-black sm:text-6xl">
                10K+
              </div>
              <div className="text-xs text-neutral-400">Developers shipping daily</div>
            </div>
            <div>
              <div className="text-gradient-kleff mb-2 text-5xl font-black sm:text-6xl">
                1M+
              </div>
              <div className="text-xs text-neutral-400">Successful deployments</div>
            </div>
            <div>
              <div className="text-gradient-kleff mb-2 text-5xl font-black sm:text-6xl">
                99.9%
              </div>
              <div className="text-xs text-neutral-400">Uptime SLA guaranteed</div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <SectionHeader
          label="Technology"
          title="Built on modern infrastructure"
          description="Cloud-native technologies powering your applications."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 pb-2">
              <GradientIcon icon={Cpu} />
              <div>
                <div className="text-sm font-semibold text-neutral-50">Kubernetes</div>
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 leading-relaxed">
              Industry-standard orchestration with auto-scaling, self-healing, and zero-downtime deployments.
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 pb-2">
              <GradientIcon icon={GitBranch} />
              <div>
                <div className="text-sm font-semibold text-neutral-50">Git Integration</div>
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 leading-relaxed">
              Connect GitHub, GitLab, or Bitbucket. Push to deploy automatically with preview environments.
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center gap-3 pb-2">
              <GradientIcon icon={Activity} />
              <div>
                <div className="text-sm font-semibold text-neutral-50">Observability</div>
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 leading-relaxed">
              Real-time metrics powered by Prometheus. Logs, traces, and alerts that actually make sense.
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Why developers choose Kleff
            </h2>
            <p className="mb-6 text-sm text-neutral-200">
              Everything you need to go from <span className="font-mono">git push</span> to production.
            </p>
            <div className="grid gap-3 text-left text-[11px] text-neutral-300 sm:grid-cols-3">
              <MiniCard
                title="Deploy in seconds"
                description="Zero-config deploys. Preview environments. Instant rollbacks."
              />
              <MiniCard
                title="Scale automatically"
                description="Handle traffic spikes without intervention. Scale down to save costs."
              />
              <MiniCard
                title="Stay compliant"
                description="Canadian data sovereignty. PIPEDA compliant. SOC 2 certified."
              />
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-white">
              Our commitment to <span className="text-gradient-kleff">developers</span>
            </h2>
            <div className="space-y-3">
              {[
                { title: "Always improving", desc: "Continuous updates based on your feedback" },
                { title: "Transparent communication", desc: "No surprises. Full changelog visibility" },
                { title: "Fair pricing", desc: "Success shouldn't bankrupt you" },
                { title: "Open source first", desc: "Inspect the code. Contribute features" },
                { title: "Canadian infrastructure", desc: "Supporting local tech ecosystem" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-gradient-kleff flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-50">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-panel p-12">
            <h2 className="mb-4 text-3xl font-semibold text-white">
              Ready to ship?
            </h2>
            <p className="mb-8 text-sm text-neutral-300">
              Join thousands of developers building the future on Kleff.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/dashboard"
                className="bg-gradient-kleff w-full rounded-full px-8 py-2.5 text-sm font-semibold text-black shadow-md shadow-black/40 transition-all hover:brightness-110 sm:w-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Building Free
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
              <a
                href="/pricing"
                className="w-full rounded-full border border-white/20 bg-white/5 px-8 py-2.5 text-sm font-semibold text-neutral-100 transition-all hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                <span className="flex items-center justify-center gap-2">
                  View Pricing
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
