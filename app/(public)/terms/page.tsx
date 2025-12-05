export default function TermsPage() {
  const lastUpdated = new Date("2024-12-05");

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Last Updated: {lastUpdated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="data-card p-8 lg:p-12 space-y-8">
          {/* Agreement to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">01</span>
              Agreement to Terms
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you and teag.me
                ("Company," "we," "us," or "our") concerning your access to and use of the teag.me website
                and QR code generation and tracking services (collectively, the "Service").
              </p>
              <p>
                BY ACCESSING OR USING THE SERVICE, YOU AGREE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE
                BOUND BY THESE TERMS. IF YOU DO NOT AGREE, YOU ARE NOT AUTHORIZED TO ACCESS OR USE THE SERVICE.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">02</span>
              Service Description
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                teag.me provides a platform for generating QR codes and tracking their usage through analytics
                data including, but not limited to, scan counts, geographic location, device information, and
                temporal data. The Service enables users to create trackable short URLs and associated QR codes
                for personal or commercial purposes.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">03</span>
              Account Registration and Security
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>To access certain features of the Service, you must register for an account using Google authentication. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or are inactive
                for extended periods.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">04</span>
              Acceptable Use Policy
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>You agree NOT to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Infringe upon or violate intellectual property rights or any other rights of others</li>
                <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>Submit false or misleading information</li>
                <li>Upload or transmit viruses, malware, or any other malicious code</li>
                <li>Collect or track personal information of others without consent</li>
                <li>Spam, phish, farm, pretext, spider, crawl, or scrape</li>
                <li>Interfere with, disrupt, or create an undue burden on the Service or networks</li>
                <li>Attempt to impersonate another user or person</li>
                <li>Sell, rent, or otherwise commercialize the Service without authorization</li>
                <li>Use any automated system to access the Service in a manner that sends more request messages than reasonably expected</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features</li>
              </ul>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">05</span>
              Intellectual Property Rights
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                The Service and its original content, features, and functionality are and will remain the
                exclusive property of teag.me and its licensors. The Service is protected by copyright,
                trademark, and other intellectual property laws. Our trademarks may not be used in connection
                with any product or service without prior written consent.
              </p>
              <p>
                You retain all rights to the QR codes and URLs you create. By using the Service, you grant us
                a limited license to store, display, and analyze your QR code data solely for the purpose of
                providing the Service to you.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Data Collection and Usage */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">06</span>
              Data Collection and Analytics
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                The Service collects analytics data when QR codes are scanned, including but not limited to:
                timestamp, geographic location (country/region), device type, operating system, and IP address.
                This data is provided to you for analytical purposes. For complete information about our data
                practices, please review our Privacy Policy.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">07</span>
              Service Availability and Modifications
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at
                any time, with or without notice. We shall not be liable to you or any third party for any
                modification, suspension, or discontinuance of the Service.
              </p>
              <p>
                While we strive to maintain high availability, we do not guarantee that the Service will be
                available at all times or that it will be error-free or uninterrupted.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">08</span>
              Disclaimers and Limitations of Liability
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p className="font-bold text-foreground uppercase tracking-wide">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED.
              </p>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL TEAG.ME, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR
                AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
                RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              <p>
                OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT
                EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100.00
                USD, WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">09</span>
              Indemnification
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                You agree to defend, indemnify, and hold harmless teag.me and its licensors, employees, agents,
                and affiliates from and against any claims, liabilities, damages, judgments, awards, losses,
                costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to
                your violation of these Terms or your use of the Service.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">10</span>
              Termination
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior
                notice or liability, for any reason, including without limitation if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. All provisions of these
                Terms which by their nature should survive termination shall survive, including ownership
                provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">11</span>
              Governing Law and Dispute Resolution
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Utah,
                United States of America, without regard to its conflict of law provisions.
              </p>
              <p>
                Any dispute arising from or relating to the subject matter of these Terms shall be finally
                settled in the state or federal courts located in Utah, and you consent to the exclusive
                jurisdiction of such courts.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">12</span>
              Changes to Terms
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of material
                changes by updating the "Last Updated" date at the top of these Terms. Your continued use of
                the Service after such modifications constitutes your acceptance of the updated Terms.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">13</span>
              Contact Information
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted/50 border-l-4 border-primary font-mono text-sm">
                <p>Email: sayhello@mkteagle.com</p>
                <p>Service: teag.me QR Analytics Platform</p>
              </div>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">14</span>
              Severability and Waiver
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be
                changed and interpreted to accomplish the objectives of such provision to the greatest extent
                possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
              <p>
                No waiver by us of any term or condition set forth in these Terms shall be deemed a further or
                continuing waiver of such term or condition or a waiver of any other term or condition.
              </p>
            </div>
          </section>

          <div className="receipt-line" />

          {/* Entire Agreement */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="mono-badge">15</span>
              Entire Agreement
            </h2>
            <div className="font-serif text-muted-foreground space-y-3 leading-relaxed">
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and
                teag.me regarding the use of the Service and supersede all prior and contemporaneous written or
                oral agreements between you and teag.me.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="mono-badge inline-block">
            LEGALLY BINDING AGREEMENT • TEAG.ME
          </div>
        </div>
      </div>
    </div>
  );
}
