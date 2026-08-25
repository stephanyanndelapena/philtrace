import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ChatbotWidget } from '@/components/chat/ChatbotWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PhilTrace — AI-Powered Transparency Platform for PH Infrastructure',
  description:
    'Citizen-facing transparency and anomaly detection platform for Philippine public infrastructure spending. Powered by Google Gemini AI, interactive satellite visualizer, and contractor collusion graph.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <ChatbotWidget />
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
          PhilTrace v3.1 — Public Infrastructure AI Transparency Auditor
        </footer>
      </body>
    </html>
  );
}
