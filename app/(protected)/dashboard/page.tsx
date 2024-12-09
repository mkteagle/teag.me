import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QRCodesTable from "@/components/qr-codes-table";

// This is mock data. In a real application, you'd fetch this from your API.
const qrCodes = [
  {
    id: 1,
    name: "Website QR",
    url: "https://example.com",
    scans: 1234,
    created: "2023-05-01",
  },
  {
    id: 2,
    name: "Product QR",
    url: "https://product.com",
    scans: 5678,
    created: "2023-05-02",
  },
  {
    id: 3,
    name: "Event QR",
    url: "https://event.com",
    scans: 9012,
    created: "2023-05-03",
  },
];

interface QRCode {
  id: string;
  redirectUrl: string;
  base64: string;
  createdAt: string;
}

export default function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary neon-border p-4 inline-block">
        QR Code Tracker
      </h1>
      <div className="grid gap-8 mb-8 md:grid-cols-2">
        <Card className="hover-lift glassmorphism">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Create QR Code
            </CardTitle>
            <CardDescription>
              Generate a new QR code for your business needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/generate">Create QR Code</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover-lift glassmorphism">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              View Analytics
            </CardTitle>
            <CardDescription>
              Track usage and analyze engagement with your QR codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card className="hover-lift glassmorphism">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Your QR Codes
          </CardTitle>
          <CardDescription>
            Click on a row to view detailed analytics for that QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QRCodesTable />
        </CardContent>
      </Card>
    </div>
  );
}
