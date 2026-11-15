import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixlo Notes — Personal Knowledge Capture & Sync',
  description:
    'Private personal note management workspace with optimistic concurrency, conflict resolution copies, and offline-first synchronization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-slate-100 flex">{children}</body>
    </html>
  );
}
