import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ViteviteApp - Gestion intelligente des files d\'attente',
  description: 'Éliminez le stress et la perte de temps liés aux files d\'attente',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-[#FFD43B] shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">ViteVite</h1>
                    <p className="text-xs text-gray-700">Gagnez du temps</p>
                  </div>
                </Link>

                <div className="flex items-center space-x-6">
                  <Link 
                    href="/services" 
                    className="text-gray-900 hover:text-gray-700 font-medium transition"
                  >
                    Services
                  </Link>
                  <Link 
                    href="/admin" 
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
                  >
                    Admin
                  </Link>
                </div>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white mt-16">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-[#FFD43B] font-bold text-lg mb-4">ViteviteApp</h3>
                  <p className="text-gray-400 text-sm">
                    Solution intelligente de gestion des files d'attente pour la Côte d'Ivoire
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link href="/services" className="hover:text-[#FFD43B]">Nos services</Link></li>
                    <li><Link href="/admin" className="hover:text-[#FFD43B]">Dashboard Admin</Link></li>
                    <li><a href="#" className="hover:text-[#FFD43B]">À propos</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Contact</h4>
                  <p className="text-gray-400 text-sm">
                    Email: contact@viteviteapp.ci<br />
                    Tel: +225 XX XX XX XX XX
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
                <p>© 2024 ViteviteApp. Porté par Soura Aminata. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}