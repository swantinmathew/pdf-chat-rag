'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
};

const riseItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', duration: 0.6, bounce: 0 },
    },
};

const giantTextVariant: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', duration: 0.8, bounce: 0 },
    },
};

export interface FooterProps {
    brandName?: string;
    description?: string;
    email?: string;
}

export default function Footer({
    brandName = "Docent",
    description = "Enterprise Retrieval-Augmented Generation engine powered by FastAPI, LangGraph, and Supabase pgvector.",
    email = "swantinmathew@gmail.com",
}: FooterProps) {
    const links = {
        product: [
            { label: "Home", href: "/" },
            { label: "PDF Document Ingestion", href: "/upload" },
            { label: "Real-time SSE AI Chat", href: "/chat" },
            { label: "RAG Pipeline Simulator", href: "#architecture" },
        ],
        stack: [
            { label: "FastAPI 0.115 (Python 3.11)", href: "#architecture" },
            { label: "LangGraph StateGraph Engine", href: "#architecture" },
            { label: "Supabase pgvector (1536D)", href: "#architecture" },
            { label: "OpenRouter Embeddings", href: "#architecture" },
        ],
        links: [
            { label: "GitHub Repository", href: "https://github.com/swantinmathew/pdf-chat-rag" },
            { label: "POST /ingest API", href: "/upload" },
            { label: "POST /chat SSE Stream", href: "/chat" },
            { label: "MIT License", href: "https://github.com/swantinmathew/pdf-chat-rag" },
        ]
    };

    return (
        <motion.footer
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative w-full bg-[#0a080d] text-slate-400 font-sans overflow-hidden flex flex-col justify-between border-t border-white/10"
        >
            {/* Main content wrapper */}
            <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16 pt-16 md:pt-24 flex flex-col border-x border-dashed border-white/10">
                
                {/* Top Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-10 md:mb-16">
                    
                    {/* Left Column (Brand info) */}
                    <motion.div variants={riseItem} className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
                        {/* Brand Name Typography */}
                        <div className="flex items-center gap-2 text-white">
                            <span className="font-semibold tracking-tight text-2xl">{brandName}</span>
                        </div>

                        {/* Description */}
                        <p className="text-[14px] leading-relaxed text-slate-400 max-w-[320px]">
                            {description}
                        </p>

                        {/* Operational Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            All Systems Operational
                        </div>

                        {/* Email / Contact */}
                        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-[15px] text-white hover:text-indigo-400 transition-colors group mt-1 font-mono">
                            {email}
                            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        </a>
                    </motion.div>

                    {/* Right Columns (Links) */}
                    <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        
                        {/* Product */}
                        <motion.div variants={riseItem} className="flex flex-col gap-4">
                            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Product</h4>
                            <ul className="flex flex-col gap-2.5">
                                {links.product.map((link, idx) => (
                                    <li key={idx}>
                                        <a href={link.href} className="text-[14px] text-slate-400 hover:text-white transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Architecture */}
                        <motion.div variants={riseItem} className="flex flex-col gap-4">
                            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Architecture</h4>
                            <ul className="flex flex-col gap-2.5">
                                {links.stack.map((link, idx) => (
                                    <li key={idx}>
                                        <a href={link.href} className="text-[13px] text-slate-400 hover:text-white transition-colors font-mono">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Resources */}
                        <motion.div variants={riseItem} className="flex flex-col gap-4">
                            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
                            <ul className="flex flex-col gap-2.5">
                                {links.links.map((link, idx) => (
                                    <li key={idx}>
                                        <a 
                                            href={link.href} 
                                            target={link.href.startsWith("http") ? "_blank" : "_self"}
                                            rel="noreferrer"
                                            className="text-[14px] text-slate-400 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>

                {/* Giant Text SVG Watermark for Docent */}
                <motion.div variants={giantTextVariant} className="w-full flex justify-center pb-0 select-none pointer-events-none">
                    <svg
                        className="w-full h-auto"
                        viewBox={`0 30 ${Math.max(brandName.length * 80, 400)} 80`}
                        preserveAspectRatio="xMidYMid meet"
                        aria-label={brandName}
                    >
                        <defs>
                            <linearGradient id="watermark-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" className="[stop-color:#333333]" />
                                <stop offset="50%" className="[stop-color:#1A1A1A]" />
                                <stop offset="100%" className="[stop-color:#0d0b0f]" />
                            </linearGradient>
                        </defs>
                        <text
                            x="0"
                            y="130"
                            dominantBaseline="alphabetic"
                            textAnchor="start"
                            textLength="100%"
                            lengthAdjust="spacing"
                            fill="url(#watermark-gradient)"
                            className="font-semibold tracking-tighter"
                            fontSize="140"
                        >
                            {brandName}
                        </text>
                    </svg>
                </motion.div>
            </div>
        </motion.footer>
    );
}
