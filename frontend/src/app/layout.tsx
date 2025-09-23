import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { AppErrorBoundary } from "@/components/ErrorBoundary";
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
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <AppErrorBoundary>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </AppErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
