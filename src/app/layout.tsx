import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DROPR - Where Taste Becomes Status",
  description: "The first AI music battle game on Roblox. Drop beats. Battle friends. Prove your taste. The algorithm is dead—you decide what goes viral.",
  keywords: ["roblox", "music", "battle", "ai", "gaming", "taste", "viral"],
  openGraph: {
    title: "DROPR - Where Taste Becomes Status",
    description: "The first AI music battle game on Roblox. Prove your taste.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DROPR - Where Taste Becomes Status",
    description: "The first AI music battle game on Roblox. Prove your taste.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0A0A0A] text-white font-body`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
