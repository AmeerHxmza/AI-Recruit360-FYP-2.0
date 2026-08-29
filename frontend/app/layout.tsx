import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { DataCacheProvider } from "@/providers/data-cache-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://ai-recruit360.vercel.app"),
  title: "AI-Recruit360 — AI-Powered Recruitment Intelligence",
  description:
    "Screen candidates, assess skills, conduct AI interviews, and turn every application into actionable hiring intelligence.",
  icons: {
    icon: "/images/air360-favicon.png",
    shortcut: "/images/air360-favicon.png",
    apple: "/images/air360-favicon.png",
  },
  openGraph: {
    title: "AI-Recruit360 — AI-Powered Recruitment Intelligence",
    description:
      "Screen candidates, assess skills, conduct AI interviews, and turn every application into actionable hiring intelligence.",
    type: "website",
    siteName: "AI-Recruit360",
    images: [
      {
        url: "/images/dashboard-intelligence.png",
        width: 1200,
        height: 630,
        alt: "AI-Recruit360 Enterprise Recruitment Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Recruit360 — AI-Powered Recruitment Intelligence",
    description:
      "Screen candidates, assess skills, conduct AI interviews, and turn every application into actionable hiring intelligence.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-[#08090B] text-[#F5F7FA] font-sans flex flex-col selection:bg-[#39D9FF]/20 selection:text-[#39D9FF]"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <DataCacheProvider>{children}</DataCacheProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

