import { ArrowRight, Check, Activity, Shield } from "lucide-react";
import { Section, SectionHeader } from "@shared/ui/Section";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Badge } from "@shared/ui/Badge";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { DollarSign, Globe, Zap, Cpu } from "lucide-react";
import { MiniCard } from "@shared/ui/MiniCard";

export function AboutUsPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <Section className="flex flex-col items-center gap-12 px-4 pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
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

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="glass-panel p-6 text-center sm:p-8 lg:p-12">
            <p className="text-lg font-medium leading-relaxed text-white sm:text-xl lg:text-2xl">
              We believe{" "}
              <span className="text-gradient-kleff">powerful cloud hosting</span>{" "}
              shouldn't break the bank or sacrifice developer experience.
            </p>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
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



      <Section className="px-4 pb-16">
        <SectionHeader
          label="Technology Stack"
          title="Built with modern, battle-tested technologies"
          description="Our infrastructure is powered by industry-leading tools and frameworks."
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="glass-panel p-6">
            <div className="mb-4">
              <GradientIcon icon={Cpu} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Backend Services</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              High-performance, scalable microservices architecture.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Go</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Java</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Spring Boot</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4">
              <GradientIcon icon={Activity} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Frontend</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              Modern, responsive user interfaces with type safety.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">TypeScript</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">React</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Tailwind CSS</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4">
              <GradientIcon icon={Shield} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Database</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              Reliable, scalable data storage with strong consistency.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">PostgreSQL</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Redis</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4">
              <GradientIcon icon={Zap} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Orchestration</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              Container orchestration with auto-scaling and self-healing.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Kubernetes</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Docker</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Helm</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4">
              <GradientIcon icon={Activity} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Observability</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              Real-time monitoring, metrics, and distributed tracing.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Prometheus</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Grafana</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Jaeger</span>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4">
              <GradientIcon icon={Globe} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Security & Auth</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
              Enterprise-grade authentication and authorization.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">Authentik</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">OAuth 2.0</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-neutral-300">OIDC</span>
            </div>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
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

      <Section className="px-4 pb-16">
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

      <Section className="px-4 pb-16">
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
