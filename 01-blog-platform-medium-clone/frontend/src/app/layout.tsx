import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Pixlo Blog — Editorial Publishing & Reading Ecosystem',
  description: 'A focused, distraction-free reading and publishing platform for independent authors and publications.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-100 py-10 mt-20 text-center text-sm text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-serif font-bold text-gray-800">Pixlo Editorial Platform</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <a href="/syndication/sitemap.xml" className="hover:underline">Sitemap</a>
              <a href="/syndication/rss/publication/architectural-horizons" className="hover:underline">RSS Feed</a>
              <span>Independent Monorepo Application</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
