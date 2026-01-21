import {
  Shield,
  Lock,
  Eye,
  Globe,
  Check,
  ArrowRight,
  FileText,
  CreditCard,
  Activity
} from "lucide-react";
import { Section, SectionHeader } from "@shared/ui/Section";
import { GradientIcon } from "@shared/ui/GradientIcon";
import { Badge } from "@shared/ui/Badge";
import { FeatureRow } from "@shared/ui/FeatureRow";
import { MiniCard } from "@shared/ui/MiniCard";

export function PrivacyPolicyPage() {
  return (
    <div className="relative isolate overflow-hidden">
      <Section className="flex flex-col items-center gap-12 px-4 pt-16 pb-12 text-center sm:pt-20 sm:pb-16">
        <div className="max-w-3xl space-y-6">
          <Badge
            variant="gradient"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
          >
            <Shield className="h-3 w-3" />
            <span>Privacy Policy</span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Your privacy
              <br />
              <span className="text-gradient-kleff">is sacred.</span>
            </h1>
            <p className="text-sm text-neutral-300 sm:text-base">
              We protect your data like it's our own. Here's exactly how.
            </p>
            <p className="text-[11px] text-neutral-400">Last updated December 6, 2024</p>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <SectionHeader
          label="Our Promise"
          title="Privacy-first platform"
          description="Built with Canadian data sovereignty and PIPEDA compliance from day one."
        />
        <div className="glass-panel-soft p-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <FeatureRow
              icon={(props) => <GradientIcon icon={Globe} {...props} />}
              title="100% Canadian"
              description="Data never leaves Canada. Ever."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Lock} {...props} />}
              title="Encrypted"
              description="End-to-end encryption. Always on."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Eye} {...props} />}
              title="Transparent"
              description="You own your data. Period."
            />
            <FeatureRow
              icon={(props) => <GradientIcon icon={Shield} {...props} />}
              title="PIPEDA Compliant"
              description="Full Canadian privacy compliance."
            />
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <SectionHeader
          label="Data Collection"
          title="What we collect and why"
          description="Only what's necessary to provide and improve our service."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <div className="glass-panel p-6">
            <div className="mb-3">
              <GradientIcon icon={FileText} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Contact Information</div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Email, name, company details needed for account creation and communication.
            </p>
          </div>
          <div className="glass-panel p-6">
            <div className="mb-3">
              <GradientIcon icon={CreditCard} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Billing Data</div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Payment information processed securely through Stripe. We never store card numbers.
            </p>
          </div>
          <div className="glass-panel p-6">
            <div className="mb-3">
              <GradientIcon icon={Activity} />
            </div>
            <div className="mb-2 text-sm font-semibold text-neutral-50">Usage Statistics</div>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Anonymous analytics to improve performance and fix bugs. No personal tracking.
            </p>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-2 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              How we use your data
            </h2>
            <p className="mb-6 text-sm text-neutral-200">
              Your information is used solely to provide and improve our hosting service.
            </p>
            <div className="grid gap-3 text-left text-[11px] text-neutral-300 sm:grid-cols-2">
              <MiniCard
                title="Service delivery"
                description="Deploy apps, process payments, and provide support."
              />
              <MiniCard
                title="Communication"
                description="Service updates, security alerts, and billing notifications."
              />
              <MiniCard
                title="Improvements"
                description="Analyze usage patterns to enhance performance and features."
              />
              <MiniCard
                title="Security"
                description="Detect threats, prevent fraud, and protect your applications."
              />
            </div>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-6 text-center text-2xl font-semibold text-white">
              Your <span className="text-gradient-kleff">data rights</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { title: "Access your data", desc: "Request a copy anytime, for any reason" },
                { title: "Delete your data", desc: "Permanent deletion within 30 days" },
                { title: "Export your data", desc: "Portable JSON format, ready to go" },
                { title: "Correct your data", desc: "Update inaccurate information instantly" },
                { title: "Opt-out of analytics", desc: "Disable non-essential tracking" },
                { title: "File a complaint", desc: "Contact Privacy Commissioner of Canada" }
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
            Data <span className="text-gradient-kleff">security</span> measures
          </h2>
          <div className="grid gap-4 text-xs text-neutral-300 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Encryption</div>
              <div className="text-neutral-400">AES-256 at rest, TLS 1.3 in transit</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Access Control</div>
              <div className="text-neutral-400">Multi-factor auth, role-based permissions</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Monitoring</div>
              <div className="text-neutral-400">24/7 security monitoring and alerts</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-2 font-semibold text-neutral-100">Audits</div>
              <div className="text-neutral-400">Regular penetration testing and reviews</div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-3 text-2xl font-semibold text-white">Questions about privacy?</h2>
            <p className="mb-6 text-xs text-neutral-300 sm:text-sm">
              Our privacy team is here to help. We respond within 24 hours.
            </p>
            <a
              href="mailto:privacy@kleff.ca"
              className="bg-gradient-kleff inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-black shadow-md shadow-black/40 transition-all hover:brightness-110"
            >
              Contact Privacy Team
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
