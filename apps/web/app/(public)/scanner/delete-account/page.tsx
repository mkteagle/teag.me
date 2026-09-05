import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/scanner/legal-shell";
import { DeleteAccountClient } from "./delete-account-client";

export const metadata: Metadata = {
  title: "Delete Account | QR Code by teag.me",
  description: "Permanently delete your QR Code by teag.me account and synced data.",
  openGraph: {
    title: "Delete Account | QR Code by teag.me",
    description: "Delete your teag.me account, synced history, tracked QR codes, and associated analytics.",
    url: "/scanner/delete-account",
    type: "website",
  },
};

export default function DeleteAccountPage() {
  return (
    <LegalShell eyebrow="teag.me/scanner/delete-account" title="Delete your account" lastUpdated="September 4, 2026">
      <p>You can delete your account here or directly inside QR Code by teag.me from History &gt; Account &gt; Delete account.</p>

      <DeleteAccountClient />

      <LegalSection title="What deletion removes">
        <ul className="list-disc space-y-2 pl-6">
          <li>Your profile and authentication records</li>
          <li>Synced URL scan and creation history</li>
          <li>Tracked teag.me QR codes and their scan analytics</li>
          <li>Your teag.me subscription-entitlement record</li>
        </ul>
        <p>Deletion is permanent and cannot be undone. History stored only on another device remains on that device until you clear it or remove the app.</p>
      </LegalSection>

      <LegalSection title="Apple subscriptions">
        <p>Deleting your teag.me account does not cancel billing managed by Apple. Before deleting, manage or cancel an active subscription in Settings &gt; Apple Account &gt; Subscriptions. Apple keeps purchase records under its own privacy and retention policies.</p>
      </LegalSection>

      <LegalSection title="Need help?">
        <p>If you cannot access your account, email <a href="mailto:privacy@teag.me">privacy@teag.me</a> from the account email address. We may ask you to verify ownership before processing a deletion request.</p>
      </LegalSection>
    </LegalShell>
  );
}
