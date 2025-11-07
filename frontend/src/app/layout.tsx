// Fichier: frontend/src/app/layout.tsx
// CE FICHIER REMPLACE COMPLÈTEMENT LE layout.tsx EXISTANT

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ViteviteApp - Gestion intelligente des files d\'attente',
  description: 'Éliminez le stress et la perte de temps liés aux files d\'attente. Marketplace intégrée, Analytics IA.',
  keywords: 'file d\'attente, Côte d\'Ivoire, Abidjan, marketplace, services publics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}