import GenerateButton from "@/components/generate-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QRPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GenerateButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
