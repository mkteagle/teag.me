export default function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date("12-06-2024").toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Terms</h2>
          <p className="mb-4">
            By accessing our QR code tracking service, you agree to be bound by
            these Terms of Service and comply with all applicable laws and
            regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to use our QR code tracking service for
            personal or commercial purposes, subject to the following
            conditions:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>You must not use the service for any illegal purposes</li>
            <li>
              You must not transmit any malicious code or attempt to harm the
              service
            </li>
            <li>
              You are responsible for all activity that occurs under your
              account
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
          <p className="mb-4">
            Our service is provided "as is". We make no warranties, expressed or
            implied, and hereby disclaim and negate all other warranties,
            including without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of
            rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
          <p className="mb-4">
            In no event shall we be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business
            interruption) arising out of the use or inability to use our
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Governing Law</h2>
          <p className="mb-4">
            These terms and conditions are governed by and construed in
            accordance with the laws of Utah and the United State of America and
            you irrevocably submit to the exclusive jurisdiction of the courts
            in that location.
          </p>
        </section>
      </div>
    </div>
  );
}
