import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Sparkles } from "lucide-react";
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
  title: "DocuMind RAG — Where AI Intelligence Meets Search Impact",
  description: "Enterprise Retrieval-Augmented Generation platform powered by FastAPI, LangGraph & Supabase Vector Store.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-screen flex flex-col bg-[#0d0b0f] text-slate-100 selection:bg-white selection:text-black font-sans overflow-x-hidden p-0 m-0">
        {/* Main Content Container - 100% Full-bleed Edge to Edge */}
        <main className="flex-1 w-full flex flex-col p-0 m-0">{children}</main>

        <footer className="border-t border-white/10 bg-[#0d0b0f] py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DocuMind RAG • Built with Next.js 15, FastAPI, LangGraph & Supabase pgvector</p>
        </footer>
      </body>
    </html>
  );
}
