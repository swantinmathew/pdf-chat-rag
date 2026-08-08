"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, RotateCcw, Sparkles, FileText, ChevronDown, ChevronUp, Bot, User, Loader2, Plus, Search, Home as HomeIcon, MessageSquare, Database, ArrowUpRight } from "lucide-react";

export interface Source {
  content: string;
  metadata?: Record<string, any>;
  similarity?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export default function ChatPage() {
  const defaultWelcomeMessage: Message = {
    id: "welcome-1",
    role: "assistant",
    content: "Hello! Ask me any question about your uploaded PDF documents. I will search your Supabase vector embeddings and stream a grounded response with source citations.",
  };

  const [messages, setMessages] = useState<Message[]>([defaultWelcomeMessage]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openSources, setOpenSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleSources = (msgId: string) => {
    setOpenSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleClearChat = () => {
    setMessages([defaultWelcomeMessage]);
    setOpenSources({});
  };

  const handleQuickPrompt = (promptText: string) => {
    setInput(promptText);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    const userMsg: Message = { id: userMsgId, role: "user", content: userText };
    const assistantMsg: Message = { id: assistantMsgId, role: "assistant", content: "", sources: [] };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: Failed to connect to server.`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.replace(/^data:\s*/, "");
          try {
            const data = JSON.parse(jsonStr);

            if (data.token) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, content: msg.content + data.token }
                    : msg
                )
              );
            }

            if (data.event === "done" && data.sources) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? { ...msg, sources: data.sources }
                    : msg
                )
              );
            }

            if (data.error) {
              throw new Error(data.error);
            }
          } catch (pErr) {
            console.warn("Error parsing SSE line:", line, pErr);
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            processLine(part);
          }
        }
        if (done) {
          if (buffer.trim()) {
            processLine(buffer);
          }
          break;
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: `❌ Connection Error: ${err.message || "Failed to fetch response. Check if backend is running."}` }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto rounded-3xl bg-[#0d0d14] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-8.5rem)]">
      {/* Left Sidebar (Matching Qubi reference image) */}
      <div className="hidden md:flex md:col-span-3 bg-[#0a0a10] border-r border-white/10 p-4 flex-col justify-between space-y-6">
        <div className="space-y-4">
          <button
            onClick={handleClearChat}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium flex items-center justify-between transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-400" />
              <span>New Chat</span>
            </div>
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-500 font-mono">
            <Search className="w-3.5 h-3.5" />
            <span>Filter history...</span>
          </div>

          <div className="space-y-1 text-xs font-medium">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Active Chat</span>
            </div>
            <Link href="/upload" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Upload PDF</span>
            </Link>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SSE Stream Connected
          </span>
          <p className="text-slate-500 font-mono text-[10px]">OpenRouter + Supabase pgvector</p>
        </div>
      </div>

      {/* Main Conversational Chat Area */}
      <div className="md:col-span-9 p-6 flex flex-col justify-between bg-slate-950/60">
        {/* Header Bar */}
        <div className="pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight">RAG Search Assistant</h1>
              <p className="text-xs text-slate-400">Context Grounded LLM Response</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SSE ACTIVE
            </span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto my-4 pr-2 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-xl ${
                  msg.role === "user"
                    ? "bg-white text-black font-medium rounded-br-none"
                    : "bg-[#0a0a10] border border-white/10 text-slate-200 rounded-bl-none backdrop-blur-xl"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 opacity-60 font-semibold">
                  <span>{msg.role === "user" ? "You" : "DocuMind AI"}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans">
                  {msg.content || (loading && msg.role === "assistant" ? "Searching documents & generating response..." : "")}
                </div>

                {/* Source Citations Accordion (Matching Qubi reference image) */}
                {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => toggleSources(msg.id)}
                      className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {openSources[msg.id] ? "Hide" : "View"} {msg.sources.length} Source Document Citation{msg.sources.length > 1 ? "s" : ""}
                      </span>
                      {openSources[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {openSources[msg.id] && (
                      <div className="mt-2.5 space-y-2">
                        {msg.sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                              <span className="truncate max-w-[200px]">
                                📄 {src.metadata?.source || src.metadata?.source_filename || `Source #${idx + 1}`}
                              </span>
                              {src.similarity !== undefined && (
                                <span className="text-emerald-400 font-semibold shrink-0 ml-2">
                                  {(src.similarity * 100).toFixed(1)}% match
                                </span>
                              )}
                            </div>
                            <p className="text-slate-300 italic bg-white/5 p-2 rounded-lg font-mono text-[11px] leading-relaxed border border-white/5">
                              "{src.content}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-white text-black font-bold flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <div className="py-2 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 font-mono shrink-0">Try asking:</span>
            <button
              onClick={() => handleQuickPrompt("What is FastAPI RAG test?")}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 shrink-0 transition-colors"
            >
              "What is FastAPI RAG test?"
            </button>
            <button
              onClick={() => handleQuickPrompt("Summarize the key points of the document.")}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 shrink-0 transition-colors"
            >
              "Summarize key points"
            </button>
          </div>
        )}

        {/* Bottom Input Form Bar */}
        <form onSubmit={handleSubmit} className="pt-3 border-t border-white/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your uploaded PDF..."
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3.5 bg-white hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-2xl transition-all shadow-xl flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
