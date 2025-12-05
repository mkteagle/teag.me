export default function PrivacyPage() {
  const lastUpdated = new Date("2024-12-05");

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Last Updated: {lastUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="data-card p-8 lg:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">01</span>
              Introduction
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                teag.me ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you use our QR code
                generation and tracking service (the "Service"). Please read this Privacy Policy carefully.
              </p>
              <p>
                BY USING THE SERVICE, YOU CONSENT TO THE DATA PRACTICES DESCRIBED IN THIS POLICY. IF YOU DO NOT
                AGREE WITH THIS PRIVACY POLICY, PLEASE DO NOT USE THE SERVICE.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">02</span>
              Information We Collect
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>We collect several types of information from and about users of our Service:</p>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">A. Account Information</h3>
                  <p className="mb-3">When you create an account through Google authentication, we collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Google account profile picture</li>
                    <li>Google account ID</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">B. QR Code Data</h3>
                  <p className="mb-3">When you create QR codes, we store:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Destination URLs</li>
                    <li>Custom short path (if provided)</li>
                    <li>QR code creation timestamps</li>
                    <li>QR code metadata</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">C. Analytics and Scan Data</h3>
                  <p className="mb-3">When someone scans your QR codes, we automatically collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Timestamp of scan</li>
                    <li>IP address (anonymized after 30 days)</li>
                    <li>Geographic location (country, region, city based on IP)</li>
                    <li>Device type and operating system</li>
                    <li>Browser type and version</li>
                    <li>Referrer information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">D. Usage Information</h3>
                  <p className="mb-3">We automatically collect information about your use of the Service:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Pages or features accessed</li>
                    <li>Time and date of access</li>
                    <li>Session duration</li>
                    <li>Clickstream data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">E. Technical Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Browser type and settings</li>
                    <li>Device identifiers</li>
                    <li>Operating system</li>
                    <li>IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <div className="receipt-line" />

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">03</span>
              How We Use Your Information
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>We use the information we collect for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve the QR code generation and tracking service</li>
                <li><strong>Analytics:</strong> To generate analytics reports about QR code scans and usage</li>
                <li><strong>Authentication:</strong> To verify your identity and manage your account</li>
                <li><strong>Communications:</strong> To send you technical notices, updates, security alerts, and administrative messages</li>
                <li><strong>Personalization:</strong> To personalize and improve your experience with the Service</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and security vulnerabilities</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                <li><strong>Research:</strong> To conduct research and analysis to improve our Service (using aggregated, anonymized data)</li>
              </ul>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">04</span>
              How We Share Your Information
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>We may share your information in the following circumstances:</p>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Service Providers</h3>
                  <p>
                    We may share your information with third-party service providers who perform services on our
                    behalf, including hosting, data analysis, authentication (Google), and customer service. These
                    providers are contractually obligated to use your information only as necessary to provide
                    services to us.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Legal Requirements</h3>
                  <p>
                    We may disclose your information if required to do so by law or in response to valid requests
                    by public authorities (e.g., court orders, subpoenas, or government agencies).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Business Transfers</h3>
                  <p>
                    If we are involved in a merger, acquisition, or sale of assets, your information may be
                    transferred as part of that transaction. We will provide notice before your information is
                    transferred and becomes subject to a different privacy policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">With Your Consent</h3>
                  <p>
                    We may share your information for any other purpose with your explicit consent.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Aggregated Data</h3>
                  <p>
                    We may share aggregated, anonymized data that cannot be used to identify you with third
                    parties for research, marketing, or other purposes.
                  </p>
                </div>
              </div>

              <p className="mt-6 font-bold text-foreground">
                We do NOT sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">05</span>
              Cookies and Tracking Technologies
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                We use cookies, web beacons, and similar tracking technologies to collect information about your
                browsing activities. Cookies are small data files stored on your device.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Types of Cookies We Use:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security)</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Service</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                </div>
              </div>

              <p className="mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your
                ability to use certain features of the Service.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">06</span>
              Data Security
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                We implement appropriate technical and organizational security measures to protect your information
                against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Encryption of data in transit using SSL/TLS</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure hosting infrastructure</li>
                <li>Regular backups and disaster recovery procedures</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While
                we strive to protect your information, we cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">07</span>
              Data Retention
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>

              <div className="mt-6 space-y-3">
                <p><strong>Account Data:</strong> Retained for the duration of your account's existence</p>
                <p><strong>QR Code Data:</strong> Retained until you delete the QR code or close your account</p>
                <p><strong>Scan Analytics:</strong> Retained for the lifetime of the associated QR code</p>
                <p><strong>IP Addresses:</strong> Anonymized after 30 days for privacy protection</p>
                <p><strong>Logs and Technical Data:</strong> Typically retained for 90 days for security and debugging purposes</p>
              </div>

              <p className="mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days,
                except where we are required to retain certain information for legal, tax, or regulatory purposes.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">08</span>
              Your Privacy Rights
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>

              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to our processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>

              <p>
                To exercise these rights, please contact us at <span className="font-mono text-primary">sayhello@mkteagle.com</span>.
                We will respond to your request within 30 days.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">09</span>
              International Data Transfers
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Your information may be transferred to and processed in countries other than your country of
                residence. These countries may have data protection laws that differ from those of your country.
              </p>
              <p>
                We take appropriate safeguards to ensure that your personal information remains protected in
                accordance with this Privacy Policy when transferred internationally.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">10</span>
              Children's Privacy
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us immediately.
              </p>
              <p>
                If we discover that we have collected personal information from a child under 13, we will delete
                that information promptly.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">11</span>
              Third-Party Services and Links
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                Our Service may contain links to third-party websites or services that are not owned or controlled
                by teag.me. We are not responsible for the privacy practices of these third-party sites.
              </p>
              <p>
                We encourage you to review the privacy policies of any third-party sites you visit. This Privacy
                Policy applies only to information collected by our Service.
              </p>
              <p className="mt-4">
                <strong>Google Authentication:</strong> We use Google OAuth for authentication. Your use of Google's
                services is governed by Google's Privacy Policy.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* California Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">12</span>
              California Privacy Rights (CCPA)
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                If you are a California resident, you have specific rights under the California Consumer Privacy
                Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information held by us</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p>
                To exercise these rights, contact us at <span className="font-mono text-primary">sayhello@mkteagle.com</span>.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* GDPR Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">13</span>
              European Privacy Rights (GDPR)
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                If you are located in the European Economic Area (EEA), you have rights under the General Data
                Protection Regulation (GDPR). Our legal basis for processing your information includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Consent:</strong> You have given consent for processing</li>
                <li><strong>Contract:</strong> Processing is necessary to perform our contract with you</li>
                <li><strong>Legal Obligation:</strong> Processing is necessary for legal compliance</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</li>
              </ul>
              <p>
                You have the right to lodge a complaint with your local data protection authority if you believe
                we have not complied with applicable data protection laws.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">14</span>
              Changes to This Privacy Policy
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for
                legal, operational, or regulatory reasons. We will notify you of material changes by:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Updating the "Last Updated" date at the top of this Privacy Policy</li>
                <li>Sending you an email notification (if you have provided your email address)</li>
                <li>Posting a notice on our Service</li>
              </ul>
              <p>
                Your continued use of the Service after such modifications constitutes your acknowledgment and
                acceptance of the updated Privacy Policy.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">15</span>
              Contact Us
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us:
              </p>
              <div className="mt-4 p-6 bg-muted/50 border-l-4 border-primary font-mono text-sm space-y-2">
                <p><strong>Email:</strong> sayhello@mkteagle.com</p>
                <p><strong>Service:</strong> teag.me QR Analytics Platform</p>
                <p><strong>Data Protection Officer:</strong> Available upon request</p>
              </div>
              <p className="mt-4">
                We will respond to your inquiry within 30 days. For urgent privacy concerns, please clearly mark
                your communication as "Privacy - Urgent."
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="mono-badge inline-block">
            GDPR & CCPA COMPLIANT • TEAG.ME
          </div>
        </div>
      </div>
    </div>
  );
}
