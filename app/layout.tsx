import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    default: "Nivio - Your personal life, organized",
    template: "%s | Nivio",
  },
  description: "Keep your tasks, spending, important dates, and daily thoughts together in one private space.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Nivio - Your personal life, organized",
    description: "Tasks, expenses, important dates, and diary entries in one private space.",
    type: "website",
    locale: "en_US",
    siteName: "Nivio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nivio - Your personal life, organized",
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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" />
      </head>
      <body className="min-h-screen bg-dash-background text-dash-text antialiased selection:bg-dash-accent-bg selection:text-dash-text">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
