import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Pixlo Recipes — Culinary Community & Precision Recipe Scaling',
  description: 'Precision recipe sharing with exact rational ingredient scaling, interactive cook mode, weekly meal planning, and dimension-safe shopping lists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-10 mt-20 text-center text-sm text-stone-500 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-bold text-stone-800">Pixlo Culinary Platform</p>
            <div className="flex gap-6 text-xs text-stone-500">
              <span>Exact Rational Scaling Engine</span>
              <span>·</span>
              <span>Dimension-Safe Grocery Aggregation</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
