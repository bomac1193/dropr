import type { Metadata } from "next";
import { EB_Garamond, DM_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DROPR | Drop heat. Prove your taste.",
  description: "A timestamp for taste. A credential for curators. Not another playlist app—proof of what you knew before the algorithm caught up.",
  keywords: ["music curation", "taste validation", "music discovery", "curator credential"],
  openGraph: {
    title: "DROPR | Drop heat. Prove your taste.",
    description: "A timestamp for taste. A credential for curators.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DROPR | Drop heat. Prove your taste.",
    description: "Your taste is valid.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ebGaramond.variable} ${dmMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
