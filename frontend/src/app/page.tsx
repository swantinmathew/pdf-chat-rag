import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center gap-8 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        ✨ Production-Ready RAG Platform
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
        Chat with your PDF Documents using <span className="text-indigo-400">AI Vector Search</span>
      </h1>

      <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
        Upload PDF files, chunk text automatically, store vector embeddings in Supabase, and stream answers grounded in your custom document context.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <span>📤 Upload Document</span>
        </Link>
        <Link
          href="/chat"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-all"
        >
          <span>💬 Start Chatting</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12 text-left">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-bold text-white mb-1">FastAPI & LangGraph</h3>
          <p className="text-sm text-slate-400">Sequential state-machine pipelines for text extraction, chunking, and embedding.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-bold text-white mb-1">Supabase pgvector</h3>
          <p className="text-sm text-slate-400">Cosine similarity search retrieving top-k relevant document passages.</p>
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-2xl mb-2">📡</div>
          <h3 className="font-bold text-white mb-1">SSE Token Streaming</h3>
          <p className="text-sm text-slate-400">Real-time Server-Sent Events typing streams with source citations.</p>
        </div>
      </div>
    </div>
  );
}
