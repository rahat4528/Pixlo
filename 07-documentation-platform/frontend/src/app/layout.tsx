import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixlo Documentation Platform",
  description: "Enterprise documentation engine with version management, OpenAPI references, and custom SSG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
