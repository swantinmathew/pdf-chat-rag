"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowUpRight, Loader2, Trash2 } from "lucide-react";

interface IngestResponse {
  status: string;
  message: string;
  filename: string;
  chunks_count: number;
  inserted_records_count: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF document files (.pdf) are supported.");
      setFile(null);
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to process PDF document.");
      }

      setResult(data as IngestResponse);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during document ingestion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-light text-white tracking-tight">Upload PDF Document</h1>
        <p className="text-slate-400 text-sm font-light">
          Ingest text, create 500-character chunks, and store vector embeddings in Supabase <code className="text-slate-200 font-mono">pgvector</code>.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-[#0d0d14] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              PDF Document File
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging
                  ? "border-white bg-white/10 scale-[1.01]"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/10 hover:border-white/30 hover:bg-white/5 bg-black/40"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
                disabled={loading}
              />
              
              {!file ? (
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white hover:underline">
                      Click to browse
                    </span>{" "}
                    <span className="text-sm text-slate-400">or drag & drop your PDF file here</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">PDF files up to 25MB</span>
                </label>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-sm font-semibold text-white truncate max-w-[300px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-slate-200 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running LangGraph Ingestion Pipeline...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                <span>Ingest & Vectorize PDF</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-red-400">Ingestion Error</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Ingestion Pipeline Complete!</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-mono">
                200 OK
              </span>
            </div>

            <p className="text-sm text-slate-300">{result.message}</p>

            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-white/10">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-500 block mb-1">Chunks Generated</span>
                <span className="font-mono text-xl font-bold text-white">
                  {result.chunks_count}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-slate-500 block mb-1">Supabase Vectors Inserted</span>
                <span className="font-mono text-xl font-bold text-white">
                  {result.inserted_records_count}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white hover:underline"
              >
                <span>Start RAG Chat with this document</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
