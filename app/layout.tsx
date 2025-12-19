import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fleeting Commerce | Launch Your E-commerce in 5 Minutes",
  description:
    "Build and launch your own professional e-commerce store in just 5 minutes. No coding required. Start selling today with Fleeting Commerce.",
  keywords: ["e-commerce", "online store", "white label", "saas", "no-code"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
