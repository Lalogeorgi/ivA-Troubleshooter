import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  title: "ivA-Troubleshooter | Medical Device Service Intelligence Platform",
  description:
    "Open-source, AI-native service intelligence, 3D spatial diagnostics, and knowledge vault platform for medical device Field Service Engineers and clinical equipment operations.",
  keywords: [
    "ivA-Troubleshooter",
    "Medical Device Service",
    "Field Service Engineering",
    "Clinical Engineering",
    "FSE",
    "Knowledge Vault",
    "Diagnostic Decision Trees",
    "3D Digital Twin",
    "Biomedical Engineering",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-full antialiased bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
