import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "mostlikelyto",
  description: "Social polling and prediction platform",
  metadataBase: new URL("https://mostlikelyto.vercel.app"),
  openGraph: {
    title: "mostlikelyto",
    description: "Social polling and prediction platform",
    url: "https://mostlikelyto.vercel.app",
    siteName: "mostlikelyto",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "mostlikelyto",
    description: "Social polling and prediction platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} antialiased`}>
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
