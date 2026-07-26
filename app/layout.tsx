import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Daybook — Your personal life, organized",
    template: "%s | Daybook",
  },
  description: "Keep your tasks, spending, important dates, and daily thoughts together in one private space.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Daybook — Your personal life, organized",
    description: "Tasks, expenses, important dates, and diary entries in one private space.",
    type: "website",
    locale: "en_US",
    siteName: "Daybook",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daybook — Your personal life, organized",
    description: "Tasks, expenses, important dates, and diary entries in one private space.",
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
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
