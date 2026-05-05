import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider"
import { CommandPalette } from "@/components/ui/CommandPalette"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "SportBaba — Sports Facility Management Platform",
    template: "%s | SportBaba",
  },
  description: "The all-in-one SaaS platform for sports facility owners. Manage bookings, inventory, memberships, and analytics — all from one powerful dashboard.",
  keywords: ["sports facility management", "futsal booking", "cricket booking", "court booking system", "sports SaaS"],
  authors: [{ name: "SportBaba" }],
  creator: "SportBaba",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SportBaba",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SportBaba",
    title: "SportBaba — Sports Facility Management Platform",
    description: "The all-in-one SaaS platform for sports facility owners.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SportBaba",
    description: "The all-in-one SaaS platform for sports facility owners.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased min-h-full flex flex-col bg-background text-foreground`}>
        <SessionProvider>
          <ThemeProvider>
            <CommandPalette />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
