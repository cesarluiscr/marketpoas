import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketPoás - Compra y vende en Poás, Costa Rica",
  description: "Marketplace del cantón de Poás, Alajuela. Publica lo que quieres vender o comprar entre vecinos de San Pedro, San Juan, Carrizal y Sabana Redonda.",
  keywords: ["MarketPoás", "Poás", "marketplace", "Costa Rica", "comprar", "vender", "Alajuela"],
  authors: [{ name: "MarketPoás" }],
  manifest: "/manifest.json",
  applicationName: "MarketPoás",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MarketPoás",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  openGraph: {
    title: "MarketPoás - Compra y vende en Poás",
    description: "El marketplace del cantón de Poás, Costa Rica",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a3d2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
