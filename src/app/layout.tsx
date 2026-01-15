import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
