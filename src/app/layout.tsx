import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const interBody = Inter({
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
  title: "DROPR",
  description: "The arena where taste is proven. Battle with AI-generated music. Prove your taste. Rise.",
  keywords: ["roblox", "music", "battle", "competition", "taste"],
  openGraph: {
    title: "DROPR",
    description: "The arena where taste is proven.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DROPR",
    description: "The arena where taste is proven.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interBody.variable} ${jetbrainsMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
