import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/scanner/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | QR Code by teag.me",
  description: "Scan anonymously on-device or optionally sign in to sync URL-only history.",
  openGraph: {
    title: "Privacy Policy | QR Code by teag.me",
    description: "QR codes decode on-device. Optional accounts sync URL-only history; Wi-Fi and text codes are never uploaded.",
    url: "/scanner/privacy",
    type: "website",
  },
};

export default function ScannerPrivacyPage() {
  return (
    <LegalShell eyebrow="teag.me/scanner/privacy" title="Privacy Policy" lastUpdated="August 2026">
      <p>
        This Privacy Policy explains how QR Code by teag.me handles your information. The app is designed to scan and create static QR codes without an account. If you choose to sign in, URL-only history and tracked codes can sync to your teag.me account.
      </p>

      <LegalSection title="The short version">
        <p>
          QR codes are decoded locally on your phone. An account is not required. Camera images, Wi-Fi credentials, plain-text QR codes, and scanned content are never sent to analytics. When you sign in, scanned URLs and their domains are saved so history can sync across devices.
        </p>
      </LegalSection>

      <LegalSection title="Accounts are optional">
        <p>
          You can use the app without providing personal information. If you create an account, we store your name, email address, authentication records, and the URL-only history you choose to sync. Social sign-in providers also process information under their own privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="Camera and photos">
        <p>
          The app uses your camera to detect QR codes and can decode a photo you select. Both operations happen on your device. The app does not record video or upload camera frames or selected images.
        </p>
      </LegalSection>

      <LegalSection title="What we process">
        <p>
          Without an account, URL history stays on your device. With an account, we process your account details and synced URL history: the URL, domain, capture time, and whether it came from the camera or a selected photo. We do not upload camera images, Wi-Fi passwords, plain-text codes, contacts, precise location, or tracking identifiers.
        </p>
      </LegalSection>

      <LegalSection title="Privacy-safe product analytics">
        <p>
          We use PostHog to understand basic product activity, such as whether a scan came from the camera or a photo, whether it decoded a URL, Wi-Fi code, or text, and whether features like history sync or subscriptions succeed. We never send the scanned value, URL, domain, photo, Wi-Fi credentials, copied text, or precise location to PostHog. Signed-in activity may be associated with your internal account ID. We do not use advertising identifiers, cross-app tracking, or device fingerprinting, and we do not sell or rent personal data.
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>
          Local history remains until you delete it or remove the app. Synced history remains until you delete links, clear history, or delete your account. Permanently delete your account and cloud history from History &gt; Account &gt; Delete account.
        </p>
      </LegalSection>

      <LegalSection title="Opening links and joining networks">
        <p>
          Your browser and destination website handle links you choose to open under their own privacy practices. Joining Wi-Fi is handled by your device and the network operator. You control whether to take either action.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>The service is not directed to children under 13, and we do not knowingly create accounts for or collect personal information from children under 13.</p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>If our practices change, we will update this page and its last-updated date before material changes take effect.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Questions? Email <a href="mailto:privacy@teag.me">privacy@teag.me</a>.</p>
      </LegalSection>
    </LegalShell>
  );
}
