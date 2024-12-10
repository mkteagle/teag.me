export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: {new Date("12-06-2024").toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Information We Collect
          </h2>
          <p className="mb-4">
            When you use our QR code tracking service, we collect:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>QR code scan data (time, location, device type)</li>
            <li>IP addresses of QR code scanners</li>
            <li>Browser and device information</li>
            <li>Usage data related to your QR codes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <p className="mb-4">We use the collected information to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide QR code tracking analytics</li>
            <li>Improve our services</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
          <p className="mb-4">
            We retain QR code scan data for as long as your account is active or
            as needed to provide our services. You can request deletion of your
            data at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="mb-4">Email: sayhello@mkteagle.com</p>
        </section>
      </div>
    </div>
  );
}
