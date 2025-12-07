import { DollarSign, MapPin, Zap, Shield } from 'lucide-react';

export function AboutUsPage() {
  return (
    <div className="relative min-h-screen">
      <div className="app-container py-16 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="text-gradient-kleff mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            About Kleff
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Making cloud hosting accessible, affordable, and Canadian
          </p>
        </div>

        <div className="space-y-8">
          <div className="glass-panel-soft p-8">
            <h2 className="text-primary mb-4 text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Kleff was founded on a simple belief: powerful cloud hosting shouldn't break the bank. We're building a platform that makes enterprise-grade infrastructure accessible to developers and businesses of all sizes, with transparent pricing that actually makes sense.
            </p>
          </div>

          <div className="glass-panel-soft p-8">
            <h2 className="text-primary mb-6 text-3xl font-bold">What Sets Us Apart</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-kleff flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                  <DollarSign className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">Transparent Pricing</h3>
                  <p className="text-muted-foreground">
                    No hidden fees, no surprise charges. Our pay-as-you-go model means you only pay for what you use, with pricing that's significantly lower than major competitors.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-kleff flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                  <MapPin className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">Proudly Canadian</h3>
                  <p className="text-muted-foreground">
                    All our infrastructure is hosted in Canada. Your data stays within Canadian jurisdiction, ensuring compliance with Canadian privacy laws and supporting the local tech ecosystem.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-kleff flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                  <Zap className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">Developer First</h3>
                  <p className="text-muted-foreground">
                    Built by developers, for developers. Simple Git integration, automatic deployments, comprehensive monitoring, and an intuitive dashboard that gets out of your way.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-kleff flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg">
                  <Shield className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2 text-xl font-semibold">Enterprise Security</h3>
                  <p className="text-muted-foreground">
                    Automatic SSL certificates, DDoS protection, encrypted data storage, and regular security audits. Enterprise-grade security without the enterprise price tag.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel-soft p-8">
            <h2 className="text-primary mb-4 text-3xl font-bold">Our Platform</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Kleff leverages modern cloud-native technologies to provide a robust, scalable hosting platform:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-border rounded-lg border bg-black/20 p-4">
                <h3 className="text-primary mb-2 text-lg font-semibold">Kubernetes Orchestration</h3>
                <p className="text-muted-foreground text-sm">
                  Automatic scaling, self-healing deployments, and zero-downtime updates powered by industry-standard container orchestration.
                </p>
              </div>
              <div className="border-border rounded-lg border bg-black/20 p-4">
                <h3 className="text-primary mb-2 text-lg font-semibold">Git Integration</h3>
                <p className="text-muted-foreground text-sm">
                  Connect your GitHub, GitLab, or Bitbucket repositories for automatic deployments on every push.
                </p>
              </div>
              <div className="border-border rounded-lg border bg-black/20 p-4">
                <h3 className="text-primary mb-2 text-lg font-semibold">Real-time Monitoring</h3>
                <p className="text-muted-foreground text-sm">
                  Comprehensive metrics dashboards powered by Prometheus, giving you full visibility into your application's performance.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-soft p-8">
            <h2 className="text-primary mb-4 text-3xl font-bold">Why Developers Choose Kleff</h2>
            <div className="text-muted-foreground space-y-4">
              <div className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Deploy in seconds</strong> - Push your code and let us handle the rest. No complex configuration required.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Scale automatically</strong> - Your applications grow with demand. Set it and forget it.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Save money</strong> - Get the same features as premium providers at a fraction of the cost.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Stay compliant</strong> - Canadian data hosting means easier compliance with local privacy regulations.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-3 text-xl">✓</span>
                <p className="leading-relaxed">
                  <strong className="text-foreground">Get support</strong> - Real humans ready to help, not just automated responses.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel-soft p-8">
            <h2 className="text-primary mb-4 text-3xl font-bold">Our Commitment</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We're committed to building a hosting platform that puts developers first. That means:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Continuous improvement based on user feedback</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Transparent communication about updates and issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Fair pricing that doesn't punish success</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Investment in Canadian tech infrastructure</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Environmental responsibility in our data center operations</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-kleff rounded-lg p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-black">Ready to Deploy?</h2>
            <p className="mb-6 text-lg text-black">
              Join thousands of developers who trust Kleff for their hosting needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/dashboard"
                className="rounded-lg bg-black px-8 py-3 font-semibold text-yellow-400 transition-colors hover:bg-gray-900"
              >
                Get Started Free
              </a>
              <a
                href="/pricing"
                className="rounded-lg bg-white px-8 py-3 font-semibold text-black transition-colors hover:bg-gray-100"
              >
                View Pricing
              </a>
            </div>
          </div>

          <div className="glass-panel-soft p-8 text-center">
            <h2 className="text-primary mb-4 text-3xl font-bold">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">
              Have questions? We'd love to hear from you.
            </p>
            <div className="text-muted-foreground space-y-2">
              <p>Email: <a href="mailto:hello@kleff.ca" className="text-primary hover:underline">hello@kleff.ca</a></p>
              <p>Support: <a href="mailto:support@kleff.ca" className="text-primary hover:underline">support@kleff.ca</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
