import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/scanner/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | teag.me Scanner",
  description:
    "The teag.me Scanner privacy policy. The app works entirely on-device — no account, no tracking, and no scan data ever leaves your phone.",
  openGraph: {
    title: "Privacy Policy | teag.me Scanner",
    description:
      "teag.me Scanner decodes QR codes on-device. No account, no analytics SDKs, no data sent to our servers.",
    url: "/scanner/privacy",
    type: "website",
  },
};

export default function ScannerPrivacyPage() {
  return (
    <LegalShell
      eyebrow="teag.me/scanner/privacy"
      title="Privacy Policy"
      lastUpdated="June 2026"
    >
      <p>
        This Privacy Policy explains how the teag.me Scanner app (&ldquo;the
        app&rdquo;) handles your information. The short version: the app is built
        to work entirely on your device, and it is designed so that there is
        almost nothing to collect in the first place.
      </p>

      <LegalSection title="The short version">
        <p>
          teag.me Scanner reads QR codes locally on your phone. It does{" "}
          <strong>not</strong> require an account, it does{" "}
          <strong>not</strong> track you, and it does <strong>not</strong> send
          your scans, the camera image, or the decoded link to teag.me servers.
          On the App Store, this is reflected as{" "}
          <strong>&ldquo;Data Not Collected.&rdquo;</strong>
        </p>
      </LegalSection>

      <LegalSection title="No account, no sign-up">
        <p>
          You can use the app without creating an account or signing in. We do
          not ask for your name, email address, phone number, contacts, or any
          other identifying information, and there is no profile associated with
          your use of the app.
        </p>
      </LegalSection>

      <LegalSection title="How the camera is used">
        <p>
          The app uses your device camera for a single purpose: to detect and
          decode QR codes in real time. The camera feed is processed on your
          device to recognize codes as they enter the frame. The app does not
          take photographs, it does not record video, and it does not store or
          upload the camera image. When you close the app or leave the scanner,
          camera access stops.
        </p>
        <p>
          iOS requires your explicit permission before any app can access the
          camera. If you decline, the scanner simply will not be able to read
          codes — and nothing else in the app sends data anywhere.
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p>
          Nothing that identifies you. The decoded content of a scan — a link,
          plain text, or Wi-Fi details — is shown to you on your device and is
          not transmitted to teag.me. We do not collect your scan history, your
          location, your contacts, or device identifiers for tracking, and we do
          not build a profile of you.
        </p>
      </LegalSection>

      <LegalSection title="No analytics, no tracking, no ads">
        <p>
          The app contains no third-party analytics SDKs, no advertising
          frameworks, and no cross-app or cross-site tracking. We do not use
          cookies or device fingerprinting, and we do not sell, rent, or share
          data about you, because we do not collect it.
        </p>
      </LegalSection>

      <LegalSection title="Opening links and connecting to networks">
        <p>
          When you choose to open a scanned link, your device hands it off to
          your browser, just like tapping any other link. From that point, the
          website you visit is responsible for its own data practices, and its
          privacy policy applies — teag.me is not involved in that request.
          Similarly, if you choose to join a Wi-Fi network from a scanned code,
          that connection is handled by iOS and the network operator, not by us.
          You are always in control of whether to take these actions.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The app does not knowingly collect any personal information from
          anyone, including children. Because the app collects no data, it is
          safe for general audiences.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If our practices ever change, we will update this page and revise the
          &ldquo;Last updated&rdquo; date above. Material changes will be
          reflected here before they take effect.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about privacy? Reach us at{" "}
          <a href="mailto:privacy@teag.me">privacy@teag.me</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
