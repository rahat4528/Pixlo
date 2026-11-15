import type { Metadata } from 'next';
import './globals.css';
import { NewsHeader } from '../components/NewsHeader';

export const metadata: Metadata = {
  title: 'Pixlo News Aggregator — Real-Time Syndication & Story Clustering',
  description:
    'Autonomous syndication platform collecting publisher headlines, clustering multi-source coverage, and providing direct publisher links.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <NewsHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-news-border bg-white py-8 px-4 sm:px-8 text-xs text-news-muted">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-news-ink text-sm">PIXLO NEWS AGGREGATOR</p>
              <p className="mt-1 max-w-xl">
                Pixlo syndicates permitted metadata, titles, and short excerpts under fair use and
                RSS syndication protocols. Readers are always directed to the original publishers for
                complete reporting. Operators must confirm each configured source's terms of use.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <a href="/admin/ingestion" className="hover:text-news-ink">Admin Console</a>
              <a href="/feed" className="hover:text-news-ink">Personalized News</a>
              <a href="/saved" className="hover:text-news-ink">Reading List</a>
              <span>© {new Date().getFullYear()} Pixlo News Systems. Standalone App 03.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
