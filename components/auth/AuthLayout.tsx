import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full max-w-xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">FleetingCommerce</span>
          </Link>

          {/* Tagline */}
          <div>
            <h1 className="text-4xl font-bold mb-6">
              Launch your dream store in minutes
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Join 10,000+ entrepreneurs who have built successful online
              businesses with Fleeting Commerce. No coding required.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-white/70 text-sm">Active Stores</p>
              </div>
              <div>
                <p className="text-3xl font-bold">$50M+</p>
                <p className="text-white/70 text-sm">Revenue Generated</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Fleeting Commerce. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
