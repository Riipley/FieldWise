import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/lib/language-context';

export const metadata: Metadata = {
  title: 'FieldWise — Smarter Rotations. Resilient Agriculture.',
  description:
    'Location-Based Agricultural Decision Support System utilizing NASA POWER environmental data to evaluate and compare resilient crop rotation strategies.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/fieldwise-icon.png',
  },
  keywords: [
    'Agriculture',
    'Crop Rotation',
    'NASA Data',
    'NASA Space Apps 2026',
    'NASA POWER',
    'Precision Agriculture',
    'Soil Health',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <LanguageProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
