export function TermsOfServicePage() {
  return (
    <div className="relative min-h-screen">
      <div className="app-container py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-gradient-kleff mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: December 6, 2024
          </p>
        </div>

        {/* Content */}
        <div className="glass-panel-soft mx-auto max-w-4xl space-y-8 p-8 md:p-12">
          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Kleff's hosting platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms constitute a legally binding agreement between you and Kleff Inc. ("Kleff," "we," "us," or "our"), a Canadian corporation.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Account Registration</h2>
            <div className="text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                To use Kleff, you must create an account. You agree to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Provide accurate, current, and complete information during registration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Maintain and promptly update your account information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Maintain the security of your account credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Accept responsibility for all activities under your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Notify us immediately of any unauthorized access or security breach</span>
                </li>
              </ul>
              <p className="leading-relaxed">
                You must be at least 18 years old or the age of majority in your jurisdiction to use our Service. By creating an account, you represent that you meet these requirements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Acceptable Use</h2>
            <div className="text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                You agree to use Kleff only for lawful purposes. You may not:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Deploy applications that violate any laws or regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Host malicious software, phishing sites, or content used for fraud</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Infringe on intellectual property rights of others</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Attempt to gain unauthorized access to our systems or other users' accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Interfere with or disrupt the Service or servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Use the Service to send spam or unsolicited communications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Deploy cryptocurrency mining applications without prior written consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Resell or redistribute the Service without authorization</span>
                </li>
              </ul>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these acceptable use policies.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Payment and Billing</h2>
            <div className="text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                Kleff offers various pricing plans including free tiers, pay-as-you-go, and subscription-based options. You agree that:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>You will provide valid payment information for paid services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>You authorize us to charge your payment method for applicable fees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>All fees are in Canadian dollars (CAD) unless otherwise specified</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Subscription fees are billed in advance on a recurring basis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Usage-based fees are calculated and billed monthly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Failure to pay may result in service suspension or termination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Refunds are provided only as specified in our refund policy</span>
                </li>
              </ul>
              <p className="leading-relaxed">
                We reserve the right to change our pricing with 30 days' notice to existing customers. Price changes do not apply retroactively.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Service Availability and Support</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we strive for 99.9% uptime, we do not guarantee uninterrupted availability of the Service. We may perform scheduled maintenance with advance notice. We are not liable for service interruptions caused by factors beyond our reasonable control, including third-party service failures, network issues, or force majeure events.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Intellectual Property</h2>
            <div className="text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                You retain all rights to the applications and content you deploy on Kleff. You grant us a limited license to host, store, and deliver your content as necessary to provide the Service.
              </p>
              <p className="leading-relaxed">
                Kleff's platform, including its software, design, branding, and documentation, is protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of our Service without written permission.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Data and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of Kleff is also governed by our Privacy Policy. We process your data in accordance with Canadian privacy laws and industry best practices. All data is stored on Canadian servers and subject to Canadian jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Backups and Data Loss</h2>
            <p className="text-muted-foreground leading-relaxed">
              While we maintain regular backups of our infrastructure, you are responsible for maintaining your own backups of your applications and data. We are not liable for any data loss, corruption, or unavailability. We strongly recommend implementing your own backup and disaster recovery procedures.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              To the maximum extent permitted by law:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Kleff is provided "as is" without warranties of any kind</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>We are not liable for indirect, incidental, or consequential damages</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>We are not responsible for third-party services or content</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold Kleff harmless from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your infringement of any rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Termination</h2>
            <div className="text-muted-foreground space-y-4">
              <p className="leading-relaxed">
                You may terminate your account at any time through your account settings. Upon termination:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Your access to the Service will cease immediately</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Your deployed applications will be taken offline</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Your data will be deleted according to our data retention policy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>No refunds will be provided for partial billing periods</span>
                </li>
              </ul>
              <p className="leading-relaxed">
                We may suspend or terminate your account if you violate these Terms, fail to pay fees, or engage in harmful activities. We will provide notice when possible, but reserve the right to terminate immediately for serious violations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Modifications to Service and Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or discontinue the Service, temporarily or permanently, with or without notice. We may also update these Terms from time to time. Significant changes will be communicated via email or platform notification. Your continued use after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Governing Law and Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of Canada and the province where Kleff is registered. Any disputes shall be resolved in the courts of that jurisdiction. You agree to submit to the exclusive jurisdiction of these courts.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Contact Information</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="text-muted-foreground space-y-1">
              <p>Email: <a href="mailto:legal@kleff.ca" className="text-primary hover:underline">legal@kleff.ca</a></p>
              <p>Kleff Inc., Canada</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
