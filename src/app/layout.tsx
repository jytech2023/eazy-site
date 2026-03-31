import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "EasySite - Build Websites with AI",
    template: "%s | EasySite",
  },
  description:
    "Create beautiful websites instantly using AI. Free to start, no coding required.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    siteName: "EasySite",
    title: "EasySite - Build Websites with AI",
    description:
      "Create beautiful websites instantly using AI. Free to start, no coding required.",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "EasySite - Build Websites with AI",
    description:
      "Create beautiful websites instantly using AI. Free to start, no coding required.",
  },
  keywords: [
    "AI website builder",
    "free website builder",
    "static site generator",
    "no-code website",
    "AI 建站",
    "免费建站",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
