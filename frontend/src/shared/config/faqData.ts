import type { LucideIcon } from "lucide-react";
import { DollarSign, Lock, Rocket, Shield, Users, Zap } from "lucide-react";

export interface FAQQuestion {
  q: string;
  a: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  questions: FAQQuestion[];
}

export const faqData: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    questions: [
      {
        q: "What is Kleff?",
        a: "Kleff is an open-source hosting platform that lets you deploy applications directly from Git with zero configuration. Built on Kubernetes with Canadian infrastructure, we offer Vercel-level developer experience without vendor lock-in."
      },
      {
        q: "How do I deploy my first application?",
        a: "Connect your GitHub, GitLab, or Bitbucket repository, select your project, and push your code. Kleff automatically detects your framework, builds your application, and deploys it—usually in under 60 seconds."
      },
      {
        q: "Which frameworks and languages does Kleff support?",
        a: "We support all major frameworks: React, Next.js, Vue, Nuxt, Angular, Svelte, Node.js, Python (Django, Flask, FastAPI), Ruby on Rails, PHP (Laravel), Go, Rust, and more. If it runs in a container, it runs on Kleff."
      },
      {
        q: "Do I need DevOps experience to use Kleff?",
        a: "No. Kleff is designed for developers, not DevOps engineers. We handle containerization, orchestration, scaling, networking, and monitoring—you just write code."
      },
      {
        q: "Can I run Kleff on my own infrastructure?",
        a: "Yes! Kleff is open-source and self-hostable. Deploy it on your own servers, on-premises hardware, or any cloud provider. The same workflow works everywhere."
      },
      {
        q: "How do preview deployments work?",
        a: "Every pull request gets its own preview URL automatically. Share it with your team to review changes before merging. Preview environments are ephemeral and destroyed when the PR is closed."
      }
    ]
  },
  {
    id: "pricing",
    title: "Pricing & Billing",
    icon: DollarSign,
    questions: [
      {
        q: "How does Kleff's pricing work?",
        a: "Pay only for what you use with transparent, usage-based billing. We charge for compute time, bandwidth, and storage—no hidden fees, no surprise charges. Free tier available for hobby projects."
      },
      {
        q: "What's included in the free tier?",
        a: "The free tier includes: 100GB bandwidth/month, 1GB persistent storage, unlimited preview deployments, automatic SSL, and community support. Perfect for personal projects and testing."
      },
      {
        q: "Can I change plans anytime?",
        a: "Yes. Upgrade or downgrade instantly with no penalties. Billing is prorated automatically, so you only pay for what you use."
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and can arrange invoicing for enterprise customers. All transactions are in Canadian dollars (CAD)."
      },
      {
        q: "Do you offer discounts for startups or students?",
        a: "Yes! We offer special pricing for YC-backed startups, GitHub Student Pack members, and early-stage companies. Contact us to learn more."
      },
      {
        q: "What happens if I exceed my plan limits?",
        a: "We'll notify you before you hit any limits. You can upgrade instantly or we'll throttle gracefully without taking your apps offline."
      }
    ]
  },
  {
    id: "performance",
    title: "Infrastructure & Performance",
    icon: Zap,
    questions: [
      {
        q: "Where are Kleff's servers located?",
        a: "All infrastructure is hosted in Canada (Toronto, Montreal, Vancouver) ensuring compliance with Canadian data protection laws and providing low-latency access for North American users."
      },
      {
        q: "What's your uptime SLA?",
        a: "We guarantee 99.9% uptime for production deployments with automated failover across multiple availability zones. Enterprise plans include 99.99% SLA."
      },
      {
        q: "How fast are deployments?",
        a: "Most applications deploy in under 60 seconds. We use smart caching and incremental builds—subsequent deployments are even faster, often under 30 seconds."
      },
      {
        q: "Does auto-scaling work automatically?",
        a: "Yes. Your applications scale horizontally based on traffic automatically. Set minimum and maximum instances, and Kleff handles the rest—including scaling down to zero for idle apps."
      },
      {
        q: "What about database scaling?",
        a: "Managed databases (PostgreSQL, MySQL, MongoDB) scale automatically with read replicas and connection pooling. You can also bring your own database."
      },
      {
        q: "How do you handle traffic spikes?",
        a: "Built-in auto-scaling responds to traffic in seconds. We also offer DDoS protection and rate limiting to keep your apps stable under any load."
      }
    ]
  },
  {
    id: "security",
    title: "Security & Compliance",
    icon: Shield,
    questions: [
      {
        q: "How secure is Kleff?",
        a: "Enterprise-grade security: automatic SSL certificates, DDoS protection, encrypted data at rest and in transit, secrets management, regular security audits, and SOC 2 compliance in progress."
      },
      {
        q: "Does Kleff comply with Canadian privacy laws?",
        a: "Yes. As a Canadian company with Canadian infrastructure, we fully comply with PIPEDA and Bill C-11. Your data stays in Canada and follows Canadian privacy regulations."
      },
      {
        q: "How do SSL certificates work?",
        a: "Automatic SSL provisioning and renewal for all domains via Let's Encrypt. Custom SSL certificates are supported for enterprise plans. All traffic is encrypted by default."
      },
      {
        q: "Can I use my own domain?",
        a: "Absolutely. Connect unlimited custom domains with automatic SSL. Supports apex domains, subdomains, and wildcard domains."
      },
      {
        q: "How do you handle secrets and environment variables?",
        a: "Encrypted secrets management with automatic rotation. Environment variables are encrypted at rest and only decrypted at runtime in isolated containers."
      },
      {
        q: "What compliance certifications do you have?",
        a: "We're working toward SOC 2 Type II certification. We're already PIPEDA compliant and follow OWASP security best practices."
      }
    ]
  },
  {
    id: "support",
    title: "Support & Resources",
    icon: Users,
    questions: [
      {
        q: "What support options are available?",
        a: "Free tier gets community support (Discord, forums). Paid plans include email support with <24h response times. Enterprise customers get dedicated Slack channels and phone support."
      },
      {
        q: "Is there documentation available?",
        a: "Comprehensive documentation covering quickstart guides, API references, deployment tutorials, troubleshooting, and best practices. Plus video tutorials and example projects."
      },
      {
        q: "Do you offer migration assistance?",
        a: "Yes! Enterprise plans include free migration assistance from Vercel, Netlify, Heroku, or any other platform. We'll help you move your apps with zero downtime."
      },
      {
        q: "Can I get help optimizing my deployments?",
        a: "Absolutely. Enterprise customers get performance audits and optimization recommendations. We'll help you reduce costs and improve speed."
      },
      {
        q: "What's your API documentation like?",
        a: "Full REST API and GraphQL API with comprehensive docs, SDKs for popular languages (Node.js, Python, Go, Ruby), and OpenAPI specs for code generation."
      },
      {
        q: "Do you have a status page?",
        a: "Yes. Real-time status page showing uptime, latency, and any incidents across all regions. Subscribe to get notifications for outages."
      }
    ]
  },
  {
    id: "technical",
    title: "Technical Details",
    icon: Lock,
    questions: [
      {
        q: "What container runtime do you use?",
        a: "We use containerd on Kubernetes for maximum compatibility and security. All images are scanned for vulnerabilities before deployment."
      },
      {
        q: "Can I use Docker Compose?",
        a: "Yes. Import your existing docker-compose.yml files directly. We'll convert them to Kubernetes deployments automatically while preserving your configuration."
      },
      {
        q: "Do you support WebSockets?",
        a: "Full WebSocket support with automatic connection draining during deployments for zero-downtime updates."
      },
      {
        q: "What about cron jobs and background workers?",
        a: "Schedule cron jobs directly in your dashboard or via API. Background workers scale independently from your web processes."
      },
      {
        q: "Can I access deployment logs in real-time?",
        a: "Yes. Stream logs in real-time via dashboard or CLI. Logs are retained for 30 days on paid plans, 7 days on free tier."
      },
      {
        q: "Do you support CI/CD integrations?",
        a: "Native GitHub Actions, GitLab CI, and CircleCI integrations. Also supports webhooks for custom CI/CD pipelines."
      }
    ]
  }
];
