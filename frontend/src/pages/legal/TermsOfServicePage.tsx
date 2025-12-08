import { Scale, Zap, CreditCard, Shield, AlertCircle, Check, ArrowRight } from "lucide-react";
import { Section, SectionHeader } from "@shared/ui/Section";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Badge } from "@shared/ui/Badge";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { MiniCard } from "@shared/ui/MiniCard";

export function TermsOfServicePage() {
  return (
    <div className="relative isolate overflow-hidden">
      <Section className="flex flex-col items-center gap-12 px-4 pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
        <div className="max-w-3xl space-y-6">
          <Badge
            variant="gradient"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
          >
            <Scale className="h-3 w-3" />
            <span>Terms of Service</span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Simple rules.
              <br />
              <span className="text-gradient-kleff">Fair terms.</span>
            </h1>
            <p className="text-sm text-neutral-300 sm:text-base">
              We keep it straightforward. No hidden clauses, no legal jargon.
            </p>
            <p className="text-[11px] text-neutral-400">Last updated December 6, 2024</p>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <SectionHeader
          label="The Basics"
          title="Core principles"
          description="What you can expect when using Kleff."
        />
        <div className="glass-panel-soft p-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <FeatureRow
              icon={(props) => <GradientIcon icon={Zap} {...props} />}
              title="Use it right"
              description="Deploy awesome apps. No abuse. No illegal content."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={CreditCard} {...props} />}
              title="Pay fair"
              description="Only pay for what you use. Cancel anytime."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Shield} {...props} />}
              title="Stay secure"
              description="We handle security. You handle code."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={AlertCircle} {...props} />}
              title="Own your data"
              description="Your code is yours. Export anytime."
            />
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <SectionHeader
          label="Acceptable Use"
          title="What you can't do"
          description="Keep the platform safe and legal for everyone."
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            "Host malware, phishing sites, or malicious software",
            "Send spam or unsolicited commercial emails",
            "Violate intellectual property or copyright laws",
            "Mine cryptocurrency without explicit permission",
            "Attempt to hack, attack, or disrupt our systems",
            "Resell or redistribute our services without authorization",
            "Harass, threaten, or abuse other users",
            "Host illegal content or facilitate illegal activities"
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <span className="text-[10px] text-neutral-400">×</span>
                </div>
                <p className="text-xs text-neutral-300">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Service Level Agreement
            </h2>
            <p className="mb-6 text-sm text-neutral-200">
              What you can expect from Kleff's infrastructure and support.
            </p>
            <div className="grid gap-3 text-left text-[11px] text-neutral-300 sm:grid-cols-2">
              <MiniCard
                title="99.9% Uptime"
                description="Production deployments with automated failover and monitoring."
              />
              <MiniCard
                title="24/7 Infrastructure"
                description="Always-on systems with redundancy across multiple zones."
              />
              <MiniCard
                title="Automated Backups"
                description="Daily snapshots retained for 30 days on paid plans."
              />
              <MiniCard
                title="DDoS Protection"
                description="Built-in protection against distributed denial of service attacks."
              />
            </div>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-white">
              Our <span className="text-gradient-kleff">promise</span> to you
            </h2>
            <div className="space-y-3">
              {[
                {
                  title: "Transparent Pricing",
                  desc: "See exactly what you pay. No hidden costs or surprise bills."
                },
                {
                  title: "Real Support",
                  desc: "Talk to humans. Email support for all users, priority for paid plans."
                },
                {
                  title: "No Lock-in",
                  desc: "Export your data and leave whenever you want. We make it easy."
                },
                {
                  title: "Regular Updates",
                  desc: "Continuous improvements based on your feedback and requests."
                },
                {
                  title: "Fair Resource Limits",
                  desc: "Generous quotas that scale with your success."
                },
                {
                  title: "Data Ownership",
                  desc: "Your code, your data, your deployments. You own everything."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="bg-gradient-kleff flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-50">{item.title}</h3>
                    <p className="text-[11px] text-neutral-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="glass-panel p-8">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            About <span className="text-gradient-kleff">pricing</span>
          </h2>
          <div className="grid gap-4 text-xs text-neutral-300 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Free Tier</div>
              <div className="text-neutral-400">
                Perfect for hobby projects. No credit card required.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Pay-as-you-go</div>
              <div className="text-neutral-400">
                Only pay for compute, bandwidth, and storage you actually use.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Team Plans</div>
              <div className="text-neutral-400">
                Predictable monthly pricing for growing teams and companies.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Cancel Anytime</div>
              <div className="text-neutral-400">
                No contracts. No penalties. Stop when you want.
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-3 text-2xl font-semibold text-white">Questions about terms?</h2>
            <p className="mb-6 text-xs text-neutral-300 sm:text-sm">
              Our legal team is happy to clarify anything. We respond within 48 hours.
            </p>
            <a
              href="mailto:legal@kleff.ca"
              className="bg-gradient-kleff inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-black shadow-md shadow-black/40 transition-all hover:brightness-110"
            >
              Contact Legal Team
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
