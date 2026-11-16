import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "Pixlo Studio — Headless CMS",
  description: "Metadata-driven content management system with schema builder, dynamic REST APIs, and plugin lifecycle.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <Navigation>{children}</Navigation>
      </body>
    </html>
  );
}
