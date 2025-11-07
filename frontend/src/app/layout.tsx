// ✅ CORRECTION COMPLÈTE: Layout avec ClientLayout + ChatBot intégré

import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';
import ChatBotPro from '@/components/ChatBot';

export const metadata: Metadata = {
  title: 'ViteviteApp - Gestion Intelligente des Files d\'Attente',
  description: 'Solution intelligente de gestion des files d\'attente en Côte d\'Ivoire avec Marketplace intégrée, Analytics IA et Notifications temps réel',
  keywords: 'files d\'attente, Côte d\'Ivoire, tickets virtuels, IA, marketplace, Abidjan',
  authors: [{ name: 'Soura Aminata' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
        
        {/* ✅ ChatBot global accessible partout */}
        <ChatBotPro />
      </body>
    </html>
  );
}