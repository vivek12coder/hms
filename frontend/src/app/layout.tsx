import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UniversalNavbar } from "@/components/layout/UniversalNavbar";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "A comprehensive Hospital Management System built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AppErrorBoundary>
          <UniversalNavbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AppErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
