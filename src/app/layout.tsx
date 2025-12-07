import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Nukus Food - Joy toping va band qiling",
  description: "Nukus shahridagi restoranlar, kafelar va choyxonalarni toping va stollarni band qiling",
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
      </body>
    </html>
  );
}
