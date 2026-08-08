import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI PDF Search & RAG Chat",
  description: "Retrieval-Augmented Generation document chat powered by FastAPI, LangGraph & Supabase Vector Store.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-400 hover:text-indigo-300 transition-colors">
              <span>📄</span>
              <span>PDF Chat RAG</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/upload" className="text-slate-300 hover:text-white transition-colors">
                Upload PDF
              </Link>
              <Link href="/chat" className="text-slate-300 hover:text-white transition-colors">
                Chat & Search
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
