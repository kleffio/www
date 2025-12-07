export function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen">
      <div className="app-container py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-gradient-kleff mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Last updated: December 6, 2024
          </p>
        </div>

        {/* Content */}
        <div className="glass-panel-soft mx-auto max-w-4xl space-y-8 p-8 md:p-12">
          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kleff ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our hosting platform. As a Canadian company, we comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and all applicable Canadian privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">Personal Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  When you create an account, we collect information such as your name, email address, billing information, and company details (if applicable). This information is necessary to provide our services and process payments.
                </p>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">Technical Information</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We automatically collect certain technical information including IP addresses, browser type, operating system, deployment logs, usage statistics, and performance metrics. This data helps us improve our services and troubleshoot issues.
                </p>
              </div>
              <div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">Application Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We process and store the applications you deploy on our platform, including source code, configuration files, environment variables, and deployment artifacts. This is necessary to provide our hosting services.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">How We Use Your Information</h2>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To provide, maintain, and improve our hosting services</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To process payments and manage your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To communicate with you about service updates, security alerts, and support</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To monitor and analyze usage patterns to improve performance</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To detect, prevent, and address technical issues and security threats</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To comply with legal obligations and enforce our Terms of Service</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              All data is stored on servers located in Canada. We implement industry-standard security measures including:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Encryption of data in transit and at rest</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Regular security audits and vulnerability assessments</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Access controls and authentication mechanisms</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Automated backup systems and disaster recovery procedures</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Employee training on data protection and privacy</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>With service providers who assist in our operations (payment processors, infrastructure providers) under strict confidentiality agreements</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>When required by law, court order, or government regulation</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>To protect our rights, property, or safety, or that of our users or the public</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>In connection with a merger, acquisition, or sale of assets (with notice to affected users)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Your Rights</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Under Canadian privacy law, you have the right to:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Access your personal information we hold</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Request correction of inaccurate or incomplete information</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Request deletion of your personal information (subject to legal retention requirements)</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Withdraw consent for certain data processing activities</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Export your data in a portable format</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Lodge a complaint with the Office of the Privacy Commissioner of Canada</span>
              </li>
            </ul>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              To exercise these rights, please contact us at privacy@kleff.ca
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide services. After account closure, we retain certain information as required by law or for legitimate business purposes such as fraud prevention and legal compliance. Backup copies may persist in our systems for up to 90 days.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              While our infrastructure is located in Canada, we may engage service providers in other countries. Any such transfers are conducted in accordance with applicable privacy laws and with appropriate safeguards in place.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or through a prominent notice on our platform. Your continued use of Kleff after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-primary mb-4 text-3xl font-bold">Contact Us</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="text-muted-foreground space-y-1">
              <p>Email: <a href="mailto:privacy@kleff.ca" className="text-primary hover:underline">privacy@kleff.ca</a></p>
              <p>Kleff Inc., Canada</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
