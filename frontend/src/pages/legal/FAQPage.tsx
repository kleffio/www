import { useState } from "react";
import { ChevronDown, Sparkles, Rocket, Zap, Shield, Users, DollarSign, Lock } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { Section } from "@shared/ui/Section";
import { Badge } from "@shared/ui/Badge";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    questions: [
      { q: "What is Kleff?", a: "Kleff is an open-source hosting platform that lets you deploy applications directly from Git with zero configuration. Built on Kubernetes with Canadian infrastructure, we offer Vercel-level developer experience without vendor lock-in." },
      { q: "How do I deploy my first application?", a: "Connect your GitHub, GitLab, or Bitbucket repository, select your project, and push your code. Kleff automatically detects your framework, builds your application, and deploys it—usually in under 60 seconds." },
      { q: "Which frameworks and languages does Kleff support?", a: "We support all major frameworks: React, Next.js, Vue, Nuxt, Angular, Svelte, Node.js, Python (Django, Flask, FastAPI), Ruby on Rails, PHP (Laravel), Go, Rust, and more. If it runs in a container, it runs on Kleff." },
      { q: "Do I need DevOps experience to use Kleff?", a: "No. Kleff is designed for developers, not DevOps engineers. We handle containerization, orchestration, scaling, networking, and monitoring—you just write code." },
      { q: "Can I run Kleff on my own infrastructure?", a: "Yes! Kleff is open-source and self-hostable. Deploy it on your own servers, on-premises hardware, or any cloud provider. The same workflow works everywhere." },
      { q: "How do preview deployments work?", a: "Every pull request gets its own preview URL automatically. Share it with your team to review changes before merging. Preview environments are ephemeral and destroyed when the PR is closed." }
    ]
  },
  {
    id: "pricing",
    title: "Pricing & Billing",
    icon: DollarSign,
    questions: [
      { q: "How does Kleff's pricing work?", a: "Pay only for what you use with transparent, usage-based billing. We charge for compute time, bandwidth, and storage—no hidden fees, no surprise charges. Free tier available for hobby projects." },
      { q: "What's included in the free tier?", a: "The free tier includes: 100GB bandwidth/month, 1GB persistent storage, unlimited preview deployments, automatic SSL, and community support. Perfect for personal projects and testing." },
      { q: "Can I change plans anytime?", a: "Yes. Upgrade or downgrade instantly with no penalties. Billing is prorated automatically, so you only pay for what you use." },
      { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and can arrange invoicing for enterprise customers. All transactions are in Canadian dollars (CAD)." },
      { q: "Do you offer discounts for startups or students?", a: "Yes! We offer special pricing for YC-backed startups, GitHub Student Pack members, and early-stage companies. Contact us to learn more." },
      { q: "What happens if I exceed my plan limits?", a: "We'll notify you before you hit any limits. You can upgrade instantly or we'll throttle gracefully without taking your apps offline." }
    ]
  },
  {
    id: "performance",
    title: "Infrastructure & Performance",
    icon: Zap,
    questions: [
      { q: "Where are Kleff's servers located?", a: "All infrastructure is hosted in Canada (Toronto, Montreal, Vancouver) ensuring compliance with Canadian data protection laws and providing low-latency access for North American users." },
      { q: "What's your uptime SLA?", a: "We guarantee 99.9% uptime for production deployments with automated failover across multiple availability zones. Enterprise plans include 99.99% SLA." },
      { q: "How fast are deployments?", a: "Most applications deploy in under 60 seconds. We use smart caching and incremental builds—subsequent deployments are even faster, often under 30 seconds." },
      { q: "Does auto-scaling work automatically?", a: "Yes. Your applications scale horizontally based on traffic automatically. Set minimum and maximum instances, and Kleff handles the rest—including scaling down to zero for idle apps." },
      { q: "What about database scaling?", a: "Managed databases (PostgreSQL, MySQL, MongoDB) scale automatically with read replicas and connection pooling. You can also bring your own database." },
      { q: "How do you handle traffic spikes?", a: "Built-in auto-scaling responds to traffic in seconds. We also offer DDoS protection and rate limiting to keep your apps stable under any load." }
    ]
  },
  {
    id: "security",
    title: "Security & Compliance",
    icon: Shield,
    questions: [
      { q: "How secure is Kleff?", a: "Enterprise-grade security: automatic SSL certificates, DDoS protection, encrypted data at rest and in transit, secrets management, regular security audits, and SOC 2 compliance in progress." },
      { q: "Does Kleff comply with Canadian privacy laws?", a: "Yes. As a Canadian company with Canadian infrastructure, we fully comply with PIPEDA and Bill C-11. Your data stays in Canada and follows Canadian privacy regulations." },
      { q: "How do SSL certificates work?", a: "Automatic SSL provisioning and renewal for all domains via Let's Encrypt. Custom SSL certificates are supported for enterprise plans. All traffic is encrypted by default." },
      { q: "Can I use my own domain?", a: "Absolutely. Connect unlimited custom domains with automatic SSL. Supports apex domains, subdomains, and wildcard domains." },
      { q: "How do you handle secrets and environment variables?", a: "Encrypted secrets management with automatic rotation. Environment variables are encrypted at rest and only decrypted at runtime in isolated containers." },
      { q: "What compliance certifications do you have?", a: "We're working toward SOC 2 Type II certification. We're already PIPEDA compliant and follow OWASP security best practices." }
    ]
  },
  {
    id: "support",
    title: "Support & Resources",
    icon: Users,
    questions: [
      { q: "What support options are available?", a: "Free tier gets community support (Discord, forums). Paid plans include email support with <24h response times. Enterprise customers get dedicated Slack channels and phone support." },
      { q: "Is there documentation available?", a: "Comprehensive documentation covering quickstart guides, API references, deployment tutorials, troubleshooting, and best practices. Plus video tutorials and example projects." },
      { q: "Do you offer migration assistance?", a: "Yes! Enterprise plans include free migration assistance from Vercel, Netlify, Heroku, or any other platform. We'll help you move your apps with zero downtime." },
      { q: "Can I get help optimizing my deployments?", a: "Absolutely. Enterprise customers get performance audits and optimization recommendations. We'll help you reduce costs and improve speed." },
      { q: "What's your API documentation like?", a: "Full REST API and GraphQL API with comprehensive docs, SDKs for popular languages (Node.js, Python, Go, Ruby), and OpenAPI specs for code generation." },
      { q: "Do you have a status page?", a: "Yes. Real-time status page showing uptime, latency, and any incidents across all regions. Subscribe to get notifications for outages." }
    ]
  },
  {
    id: "technical",
    title: "Technical Details",
    icon: Lock,
    questions: [
      { q: "What container runtime do you use?", a: "We use containerd on Kubernetes for maximum compatibility and security. All images are scanned for vulnerabilities before deployment." },
      { q: "Can I use Docker Compose?", a: "Yes. Import your existing docker-compose.yml files directly. We'll convert them to Kubernetes deployments automatically while preserving your configuration." },
      { q: "Do you support WebSockets?", a: "Full WebSocket support with automatic connection draining during deployments for zero-downtime updates." },
      { q: "What about cron jobs and background workers?", a: "Schedule cron jobs directly in your dashboard or via API. Background workers scale independently from your web processes." },
      { q: "Can I access deployment logs in real-time?", a: "Yes. Stream logs in real-time via dashboard or CLI. Logs are retained for 30 days on paid plans, 7 days on free tier." },
      { q: "Do you support CI/CD integrations?", a: "Native GitHub Actions, GitLab CI, and CircleCI integrations. Also supports webhooks for custom CI/CD pipelines." }
    ]
  }
];

export function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="relative isolate overflow-hidden">
      <Section className="flex flex-col items-center gap-12 pt-20 pb-16 text-center">
        <div className="max-w-3xl space-y-6">
          <Badge
            variant="gradient"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium"
          >
            <Sparkles className="h-3 w-3" />
            <span>Frequently Asked Questions</span>
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Ship faster.
              <br />
              <span className="text-gradient-kleff">Ask anything.</span>
            </h1>
            <p className="text-sm text-neutral-300 sm:text-base">
              Everything you need to know about deploying, scaling, and managing your applications on Kleff.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setOpenQuestion(0);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
                    isActive
                      ? "bg-gradient-kleff text-black shadow-sm shadow-black/40"
                      : "border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="glass-panel p-3">
            <div className="space-y-2">
              {currentCategory?.questions.map((q, idx) => {
                const isOpen = openQuestion === idx;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg border border-white/10 transition-all",
                      isOpen ? "bg-white/10" : "bg-white/5 hover:bg-white/7"
                    )}
                  >
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-kleff flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black">
                          {idx + 1}
                        </div>
                        <h3 className="text-sm font-semibold text-neutral-50">
                          {q.q}
                        </h3>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 flex-shrink-0 text-kleff-primary transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/10 px-4 pb-4 pt-3">
                        <p className="text-xs text-neutral-300 leading-relaxed sm:text-sm">
                          {q.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="glass-panel-soft p-8">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-bold text-white">10K+</div>
              <div className="text-[11px] text-neutral-400">Active developers</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-white">1M+</div>
              <div className="text-[11px] text-neutral-400">Deployments monthly</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-white">99.9%</div>
              <div className="text-[11px] text-neutral-400">Uptime guarantee</div>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass-panel-soft p-8">
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Still have questions?
            </h2>
            <p className="mb-6 text-xs text-neutral-300 sm:text-sm">
              Our team is here to help you get the most out of Kleff.
            </p>
            <a
              href="mailto:support@kleff.ca"
              className="bg-gradient-kleff inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-black shadow-md shadow-black/40 transition-all hover:brightness-110"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Contact Support
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
