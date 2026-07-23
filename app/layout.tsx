import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Minimal SaaS Template — Production Next.js Starter",
    template: "%s | Minimal SaaS",
  },
  description: "A clean, scalable, production-ready SaaS starter built with Next.js, TypeScript, TailwindCSS, and Firebase.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Minimal SaaS Template",
    description: "Production-ready starter template for modern web applications.",
    type: "website",
    locale: "en_US",
    siteName: "Minimal SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minimal SaaS Template",
    description: "Production-ready starter template for modern web applications.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-black selection:text-white">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
