import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "Capsule Platform",
  description: "Modern Learning Platform"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
