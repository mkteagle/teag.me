import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/scanner/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service | QR Code by teag.me",
  description:
    "Terms for QR Code by teag.me, including the optional auto-renewing teag.me Pro subscription.",
  openGraph: {
    title: "Terms of Service | QR Code by teag.me",
    description:
      "Plainspoken terms for QR Code by teag.me and the optional teag.me Pro subscription. Provided as is, with no warranty about third-party links.",
    url: "/scanner/terms",
    type: "website",
  },
};

export default function ScannerTermsPage() {
  return (
    <LegalShell
      eyebrow="teag.me/scanner/terms"
      title="Terms of Service"
      lastUpdated="September 4, 2026"
    >
      <p>
        These Terms of Service (the &ldquo;Terms&rdquo;) are an agreement between
        you and teag.me covering your use of the QR Code by teag.me app (&ldquo;the
        app&rdquo;). By downloading or using the app, you agree to these Terms.
        If you do not agree, please do not use the app.
      </p>

      <LegalSection title="License to use the app">
        <p>
          QR Code by teag.me includes free scanning, QR creation, and local history, with an
          optional paid teag.me Pro subscription. We grant you a personal,
          non-exclusive, non-transferable, revocable license to install and use
          the app on devices you own or control, for both personal and
          commercial use, subject to these Terms and the App Store Terms of
          Service.
        </p>
      </LegalSection>

      <LegalSection title="Accounts and deletion">
        <p>
          An account is optional. You can permanently delete your account and synced data inside the app from History &gt; Account &gt; Delete account, or at our <a href="/scanner/delete-account">account deletion page</a>. Account deletion removes your profile, authentication records, synced URL history, tracked QR codes, their scan analytics, and your teag.me entitlement record. Deletion cannot be undone.
        </p>
        <p>
          Deleting your account does not cancel an Apple subscription. You must manage or cancel App Store billing separately through your Apple ID subscription settings. If you delete an account with an active subscription, contact <a href="mailto:hello@teag.me">hello@teag.me</a> if you need help associating a valid purchase with a new account.
        </p>
      </LegalSection>

      <LegalSection title="teag.me Pro subscription">
        <p>
          Anonymous scanning and local history are free. You may purchase teag.me
          Pro as an auto-renewing monthly subscription through Apple. The price
          shown in the app is charged to your Apple ID when you confirm purchase.
          Your subscription renews automatically unless you cancel at least 24
          hours before the current period ends. Apple may charge your account for
          renewal within 24 hours before that period ends.
        </p>
        <p>
          Manage or cancel the subscription in your App Store account settings.
          Restoring purchases verifies the active Apple subscription against the
          teag.me account currently signed in. Purchases are subject to Apple&apos;s
          payment and refund terms.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree to use the app lawfully. You agree not to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            use the app to decode, access, or distribute content you are not
            authorized to access;
          </li>
          <li>
            use the app to facilitate fraud, phishing, malware distribution, or
            any other unlawful or harmful activity;
          </li>
          <li>
            reverse engineer, decompile, or attempt to extract source code from
            the app, except where that restriction is prohibited by law; or
          </li>
          <li>
            interfere with, disrupt, or attempt to gain unauthorized access to
            the app or any related systems.
          </li>
        </ul>
        <p>
          You are responsible for how you use the content you decode, including
          any links you choose to open and any data you choose to act on.
        </p>
      </LegalSection>

      <LegalSection title="Third-party links and networks">
        <p>
          A QR code can point anywhere. The app shows you the decoded
          destination so you can decide for yourself, but it cannot guarantee
          that any website, network, or other resource is safe, accurate, or
          appropriate. When you open a scanned link or join a scanned network,
          you do so at your own discretion and risk. teag.me does not control
          and is not responsible for the content, conduct, security, or
          consequences of any third-party site or network you reach through a
          scanned code. Always use your own judgment before opening a link, even
          one that looks familiar.
        </p>
      </LegalSection>

      <LegalSection title="No warranty">
        <p>
          The app is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
          <strong>&ldquo;as available,&rdquo;</strong> without warranties of any
          kind, whether express or implied, including but not limited to implied
          warranties of merchantability, fitness for a particular purpose, and
          non-infringement. The app decodes and displays QR content as
          accurately as it can, but we do not warrant that decoding will be
          error-free or that any destination is trustworthy.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, teag.me will not be liable for
          any indirect, incidental, special, consequential, or punitive damages,
          or for any loss arising from your use of the app or from any site,
          network, or content you reach through a scanned code. Our total
          liability to you for any claim
          relating to the app is limited to the amount you paid to us for the app
          or service during the twelve months before the claim.
        </p>
      </LegalSection>

      <LegalSection title="Changes to the app and these Terms">
        <p>
          We may update, change, or discontinue the app at any time. We may also
          update these Terms from time to time; when we do, we will revise the
          &ldquo;Last updated&rdquo; date above. Your continued use of the app
          after an update means you accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These Terms are governed by the laws of the State of Utah, United
          States, without regard to its conflict-of-law rules. Any dispute
          relating to the app or these Terms will be subject to the exclusive
          jurisdiction of the state and federal courts located in Utah.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these Terms? Reach us at{" "}
          <a href="mailto:hello@teag.me">hello@teag.me</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
