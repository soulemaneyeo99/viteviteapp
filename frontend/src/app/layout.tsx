import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import ChatWidget from '@/components/ai/ChatWidget';
import UserNavbar from "@/components/UserNavbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ViteviteApp - Gestion Intelligente des Files d'Attente",
  description: "Révolutionnez votre temps d'attente en Côte d'Ivoire avec des tickets virtuels et des prédictions IA",
  keywords: "files d'attente, Côte d'Ivoire, tickets virtuels, IA, Abidjan",
  authors: [{ name: "ViteviteApp" }],
  openGraph: {
    title: "ViteviteApp - Fini les files d'attente",
    description: "Prenez votre ticket virtuel et recevez une notification quand c'est votre tour",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased bg-gray-50">
        <Providers>
          <UserNavbar />
          {children}
          <ChatWidget />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}