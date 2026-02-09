import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PropSpace X - Enterprise Real Estate Platform",
  description:
    "The enterprise platform connecting buyers and agents with verified, transparent blockchain-backed real estate listings.",
  openGraph: {
    title: "PropSpace X - Enterprise Real Estate Platform",
    description:
      "Buy, sell, and rent properties with the security and transparency of blockchain technology.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@PropSpaceX",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
