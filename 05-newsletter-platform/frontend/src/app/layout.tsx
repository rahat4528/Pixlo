import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Pixlo Newsletter Platform — Audience Broadcast & Creator Studio',
  description: 'Audience relationship and newsletter broadcast engine with double opt-in, template rendering, and engagement tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          Pixlo Newsletter Platform &bull; Independent Audience Broadcast Engine
        </footer>
      </body>
    </html>
  );
}
