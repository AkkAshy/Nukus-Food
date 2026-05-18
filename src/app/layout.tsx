import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nukus Food - Joy toping va band qiling",
  description: "Nukus shahridagi restoranlar, kafelar va choyxonalarni toping va stollarni band qiling",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nukus Food",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${jakarta.variable} font-sans antialiased bg-gray-50`}>
        <Header />
        <main>{children}</main>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
