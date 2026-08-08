'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeatureSection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const features = [
    {
      id: 0,
      tag: "STAGE 01",
      title: "PDF Text Extraction",
      description: "Extracts raw text streams from multi-page PDFs using PyPDF while stripping null bytes and formatting artifacts.",
      metrics: [
        { label: "Parsing Speed", value: "Sub-50ms / page" },
        { label: "File Support", value: "PDF 1.4 – 2.0" },
        { label: "Sanitization", value: "100% Clean Strings" },
      ],
      codeSnippet: `def load_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    extracted = ""
    for page in reader.pages:
        extracted += page.extract_text()
    return clean_text(extracted)`,
    },
    {
      id: 1,
      tag: "STAGE 02",
      title: "Sliding-Window Chunker",
      description: "Splits extracted text into 500-character chunks with 50-character sentence boundary overlap to preserve semantic context.",
      metrics: [
        { label: "Chunk Size", value: "500 characters" },
        { label: "Chunk Overlap", value: "50 characters" },
        { label: "Splitter Engine", value: "Recursive Character" },
      ],
      codeSnippet: `splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", ". "]
)
chunks = splitter.split_text(raw_text)`,
    },
    {
      id: 2,
      tag: "STAGE 03",
      title: "1536D Vector Engine",
      description: "Converts text chunks into 1,536-dimensional embeddings and executes fast cosine similarity search via Supabase pgvector.",
      metrics: [
        { label: "Embedding Model", value: "text-embedding-3-small" },
        { label: "Vector Dimension", value: "1,536 numbers" },
        { label: "Search Index", value: "HNSW / Cosine RPC" },
      ],
      codeSnippet: `SELECT id, content, metadata, 
       1 - (embedding <=> query_vector) AS similarity
FROM documents
ORDER BY embedding <=> query_vector
LIMIT 5;`,
    },
  ];

  const currentFeature = features[activeTab];

  return (
    <section className="relative w-full bg-[#0d0b0f] py-24 px-6 md:px-12 lg:px-20 border-t border-white/10 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
        {/* Minimal Section Header - Pure White / Solid Typography */}
        <div className="text-left space-y-3 max-w-2xl">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            RAG ARCHITECTURE PIPELINE
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
            How Document Search Works
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-normal">
            Explore how uploaded PDF documents are processed, chunked, and indexed for sub-second similarity search.
          </p>
        </div>

        {/* Stage Tabs - Minimal Solid Border Styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, idx) => {
            const isActive = activeTab === idx;

            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(idx)}
                className={`p-6 rounded-2xl text-left transition-all duration-200 border ${
                  isActive
                    ? "border-white bg-white/10 shadow-xl"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{feature.description}</p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">
                  {currentFeature.tag} PROCESSOR
                </span>
                <h3 className="text-3xl font-light text-white tracking-tight">
                  {currentFeature.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-normal">
                  {currentFeature.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                {currentFeature.metrics.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">{m.label}</span>
                    <span className="text-xs font-bold text-white font-mono">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Code Column */}
            <div className="lg:col-span-5 bg-black rounded-xl border border-white/10 p-5 font-mono text-xs text-slate-300 flex flex-col justify-between overflow-x-auto">
              <div className="pb-3 border-b border-white/10 text-slate-400 text-[11px] font-mono">
                langgraph_node.py
              </div>
              <pre className="py-4 text-white leading-relaxed overflow-x-auto text-[11px]">
                <code>{currentFeature.codeSnippet}</code>
              </pre>
              <div className="pt-3 border-t border-white/10 text-[10px] text-slate-500 font-mono">
                Python 3.11 Execution Node
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
