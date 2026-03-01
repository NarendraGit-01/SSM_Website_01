import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/layout/FloatingButtons";
import { getSiteConfig } from "@/app/actions";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Srinivasa Steel Metals | Premium Gates, UPVC & Interiors",
  description: "Excellence in manufacturing steel gates, UPVC doors, iron works, and home interiors. Modern designs, durable quality.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-inter antialiased">
        <Navbar config={config} />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer config={config} />
        <FloatingButtons config={config} />
      </body>
    </html>
  );
}
