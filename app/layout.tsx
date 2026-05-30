import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SheetsAPI â€” Google Sheets as a REST API",
    template: "%s | SheetsAPI",
  },
  description:
    "Turn any Google Sheet into a REST API in 60 seconds. Webhooks, caching, CORS, CRUD â€” everything SheetBest doesn't have.",
  keywords: [
    "google sheets api",
    "sheetbest alternative",
    "google sheets rest api",
    "no-code backend",
    "sheets to api",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://sheetsapi.io"
  ),
  openGraph: {
    type: "website",
    siteName: "SheetsAPI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    'apple-itunes-app': 'app-id=PLACEHOLDER_APP_ID',
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
