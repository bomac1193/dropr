import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DROPR | Because Taste Pays",
  description: "The first platform where music taste becomes equity. Battle with AI remixes, prove your judgment, earn stakes in the AI you're training.",
  keywords: ["taste economy", "music curation", "AI music", "earn from taste", "roblox"],
  openGraph: {
    title: "DROPR | Because Taste Pays",
    description: "Your taste pays you. Literally. The first platform where music taste becomes equity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DROPR | Because Taste Pays",
    description: "Your taste pays you. Literally.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
