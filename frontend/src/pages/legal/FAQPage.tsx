import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@shared/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  questions: FAQItem[];
}

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const faqs: FAQCategory[] = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is Kleff?",
          a: "Kleff is a Canadian hosting platform that allows developers and businesses to deploy applications directly from their Git repositories. We offer competitive pricing with pay-as-you-go and tiered plans, making deployment accessible and affordable."
        },
        {
          q: "How do I deploy my first application?",
          a: "Simply connect your Git repository (GitHub, GitLab, or Bitbucket), select your project, configure your build settings, and click deploy. Kleff automatically builds and deploys your application with zero configuration required for most frameworks."
        },
        {
          q: "What frameworks and languages does Kleff support?",
          a: "Kleff supports all major frameworks including React, Next.js, Vue, Angular, Node.js, Python (Django, Flask), Ruby on Rails, PHP, Go, and more. We use containerization to support virtually any technology stack."
        }
      ]
    },
    {
      category: "Pricing & Billing",
      questions: [
        {
          q: "How does Kleff's pricing work?",
          a: "We offer flexible pricing options including pay-as-you-go and tiered subscription plans. You only pay for the resources you use - no hidden fees. Our pricing is significantly more affordable than major competitors while maintaining enterprise-grade infrastructure."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, PayPal, and can arrange invoicing for enterprise customers. All transactions are processed securely in Canadian dollars (CAD)."
        },
        {
          q: "Can I switch between pricing plans?",
          a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges accordingly."
        },
        {
          q: "Is there a free tier?",
          a: "Yes, we offer a free tier perfect for hobby projects and testing. This includes limited builds, bandwidth, and compute resources. You can upgrade anytime as your needs grow."
        }
      ]
    },
    {
      category: "Infrastructure & Performance",
      questions: [
        {
          q: "Where are Kleff's servers located?",
          a: "All our infrastructure is hosted in Canada, ensuring compliance with Canadian data protection laws and providing low-latency access for North American users. This also means your data stays within Canadian jurisdiction."
        },
        {
          q: "How does Kleff ensure high availability?",
          a: "We use Kubernetes orchestration across multiple availability zones, automatic health checks, and instant failover. Our infrastructure is designed for 99.9% uptime with built-in redundancy."
        },
        {
          q: "Can my application auto-scale?",
          a: "Absolutely! Kleff supports horizontal and vertical scaling based on your application's needs. Configure auto-scaling rules or let our intelligent system handle it automatically."
        },
        {
          q: "What monitoring tools does Kleff provide?",
          a: "We provide real-time metrics dashboards showing CPU, memory, network usage, request rates, and error logs. You can also integrate with external monitoring tools via our API."
        }
      ]
    },
    {
      category: "Security & Compliance",
      questions: [
        {
          q: "How secure is Kleff?",
          a: "Security is our top priority. We provide automatic SSL certificates, DDoS protection, encrypted data at rest and in transit, regular security audits, and compliance with industry standards."
        },
        {
          q: "Does Kleff comply with Canadian privacy laws?",
          a: "Yes, as a Canadian company with Canadian-hosted infrastructure, we fully comply with PIPEDA (Personal Information Protection and Electronic Documents Act) and other relevant Canadian privacy regulations."
        },
        {
          q: "Can I use my own domain?",
          a: "Yes! You can connect custom domains to your deployments. We automatically provision SSL certificates and handle DNS configuration."
        }
      ]
    },
    {
      category: "Support & Resources",
      questions: [
        {
          q: "What support options are available?",
          a: "We offer email support for all users, with priority support and dedicated account managers for enterprise customers. Our documentation covers most common scenarios, and our community forum is active and helpful."
        },
        {
          q: "How quickly can I expect a response?",
          a: "Free tier users typically receive responses within 24-48 hours. Paid plans get priority support with response times under 12 hours. Enterprise customers have access to 24/7 support."
        },
        {
          q: "Is there documentation available?",
          a: "Yes! We maintain comprehensive documentation including quickstart guides, API references, deployment tutorials, and best practices. Visit our docs site for detailed information."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="relative min-h-screen">
      <div className="app-container py-16 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="text-gradient-kleff mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Everything you need to know about Kleff hosting
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-8">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="glass-panel-soft overflow-hidden p-6 md:p-8">
              <h2 className="text-primary mb-6 text-2xl font-bold md:text-3xl">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === key;

                  return (
                    <div
                      key={qIdx}
                      className="border-border rounded-lg border bg-black/20 transition-colors hover:bg-black/30"
                    >
                      <button
                        onClick={() => toggleQuestion(catIdx, qIdx)}
                        className="flex w-full items-center justify-between p-4 text-left"
                      >
                        <h3 className="text-foreground pr-4 text-base font-semibold md:text-lg">
                          {faq.q}
                        </h3>
                        <ChevronDown
                          className={cn(
                            "text-primary h-5 w-5 flex-shrink-0 transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-border border-t px-4 pb-4 pt-3">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel mx-auto mt-16 max-w-2xl p-8 text-center">
          <h2 className="text-primary mb-4 text-2xl font-bold">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="mailto:support@kleff.ca"
            className="bg-gradient-kleff inline-block rounded-lg px-8 py-3 font-semibold text-black transition-all hover:brightness-110"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
