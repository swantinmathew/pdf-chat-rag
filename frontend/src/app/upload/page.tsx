'use client';

import DocumentUploader from "@/components/DocumentUploader";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#0d0b0f] text-slate-100 p-0 m-0">
      {/* Top Navbar Header — Pure Typography No Logo */}
      <header className="w-full px-6 md:px-12 lg:px-20 py-6 flex items-center justify-between border-b border-white/10 bg-[#0d0b0f]/80 backdrop-blur-md">
        <Link href="/" className="shrink-0">
          <span className="text-white text-xl font-semibold tracking-tight hover:opacity-90 transition-opacity">Docent</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
          <Link href="/chat" className="text-slate-400 hover:text-white transition-colors">AI Chat</Link>
        </nav>
      </header>

      {/* Main Upload Body */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-4xl font-light text-white tracking-tight">Upload PDF Document</h1>
          <p className="text-slate-400 text-sm font-light">
            Ingest text, create 500-character chunks, and store vector embeddings in Supabase <code className="text-slate-200 font-mono">pgvector</code>.
          </p>
        </div>

        {/* Watermelon UI Document Uploader Component */}
        <DocumentUploader
          title="Document Ingestion"
          acceptedFormats={["pdf", "docx"]}
          maxFileSizeMb={25}
        />

        <div className="text-center pt-2">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
          >
            <span>Go to RAG Search & Chat →</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
