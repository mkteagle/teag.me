"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-blue-900 to-purple-900 opacity-50" />
      <div className="absolute inset-0 bg-[url('/bg.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Content */}
      <div className="relative glassmorphism border border-white/10 rounded-lg p-8 max-w-lg w-full text-center space-y-6">
        {/* Error Code with Glow */}
        <div className="relative">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient">
            404
          </h1>
          <div className="absolute inset-0 blur-xl opacity-50 bg-blue-500 -z-10" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
          <p className="text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => router.push("/")}
            className="hover-lift transition-all duration-300"
          >
            Return Home
          </Button>
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="hover-lift transition-all duration-300"
          >
            Go Back
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
        </div>
      </div>
    </div>
  );
}
