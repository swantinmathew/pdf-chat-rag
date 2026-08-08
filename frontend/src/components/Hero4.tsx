'use client';

import React from 'react';
import Link from 'next/link';
import { Play, ChevronDown, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';

export interface NavLink {
    label: string;
    href: string;
    hasDropdown?: boolean;
}

export interface Hero4Props {
    brandName?: string;
    navLinks?: NavLink[];
    loginLabel?: string;
    loginHref?: string;
    badgeText?: string;
    headingLine1?: string;
    headingLine2?: string;
    description?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    achievementText?: string;
    backgroundImage?: string;
}

export default function Hero4({
    brandName = 'DocuMind RAG',
    navLinks = [
        { label: 'Architecture', href: '#', hasDropdown: true },
        { label: 'LangGraph', href: '#', hasDropdown: true },
        { label: 'Supabase Vector', href: '#' },
        { label: 'SSE Stream', href: '#' },
        { label: 'Docs', href: '#' },
    ],
    loginLabel = 'Upload PDF',
    loginHref = '/upload',
    badgeText = '✦  Powered by FastAPI, LangGraph & Supabase pgvector',
    headingLine1 = 'Where AI Intelligence',
    headingLine2 = 'Meets Search Impact.',
    description = 'DocuMind empowers modern teams to ingest PDFs, vectorize text with Supabase pgvector, and stream grounded RAG answers in real-time.',
    primaryCtaLabel = 'Start RAG Chat',
    primaryCtaHref = '/chat',
    secondaryCtaLabel = 'Upload PDF',
    secondaryCtaHref = '/upload',
    achievementText = "Processed over 1,000+ vector chunks with sub-second retrieval",
    backgroundImage = 'https://assets.watermelon.sh/hero-5.avif',
}: Hero4Props) {

    const line1Words = headingLine1.split(' ');
    const line2Words = headingLine2.split(' ');

    // Mouse tracking for subtle spotlight elevation
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <section 
            className="relative w-full min-h-screen overflow-hidden bg-[#0d0b0f] group flex flex-col justify-between p-0 m-0"
            onMouseMove={handleMouseMove}
        >

            {/* Background Image — Full Screen Cover */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.12, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 2.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <img
                    src={backgroundImage}
                    alt="Hero background"
                    className="h-full w-full object-cover object-center opacity-70"
                />
            </motion.div>

            {/* Ambient Gradient Overlays for Seamless Blending */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0d0b0f] via-[#0d0b0f]/30 to-[#0d0b0f]/50" />
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0d0b0f]/80 via-transparent to-transparent" />

            {/* Noise texture */}
            <div
                className="absolute inset-0 z-[1] opacity-[0.035] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '128px 128px',
                }}
            />

            {/* Mouse-tracking spotlight for minimal elevation */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.05),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col h-full w-full flex-1 justify-between">

                {/* ─── Navbar ─── */}
                <motion.nav
                    className="w-full px-6 md:px-12 lg:px-20 py-6 flex items-center justify-between"
                    initial={{ opacity: 0, y: -24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0 group/logo">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-lg font-semibold tracking-tight transition-all duration-300">
                            {brandName}
                        </span>
                    </Link>

                    {/* Center Nav Links */}
                    <div className="hidden lg:flex items-center gap-7 xl:gap-9">
                        {navLinks.map((link, idx) => (
                            <motion.a
                                key={idx}
                                href={link.href}
                                className="flex items-center gap-1 text-white/75 hover:text-white text-[14px] font-medium transition-colors duration-200 relative group/nav"
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 + idx * 0.07 }}
                            >
                                {link.label}
                                {link.hasDropdown && (
                                    <ChevronDown size={14} strokeWidth={2} className="text-white/50 group-hover/nav:text-white/80 transition-colors" />
                                )}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-white/60 group-hover/nav:w-full transition-all duration-300" />
                            </motion.a>
                        ))}
                    </div>

                    {/* Right Side — Log in / Upload */}
                    <div className="flex items-center gap-5">
                        <motion.a
                            href={loginHref}
                            className="flex items-center gap-2.5 text-white/85 hover:text-white transition-colors text-[14px] font-medium group"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            {loginLabel}
                        </motion.a>

                        <button className="lg:hidden text-white p-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="3" y1="7" x2="21" y2="7" />
                                <line x1="3" y1="12" x2="16" y2="12" />
                                <line x1="3" y1="17" x2="21" y2="17" />
                            </svg>
                        </button>
                    </div>
                </motion.nav>

                {/* ─── Hero Content ─── */}
                <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 py-12 md:py-20 max-w-5xl">
                    <div className="max-w-3xl">

                        {/* Badge pill */}
                        <motion.div
                            className="inline-flex items-center mb-6 md:mb-8"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                        >
                            <span className="relative inline-flex items-center px-4 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium text-white/85 border border-white/15 bg-white/5 backdrop-blur-sm overflow-hidden">
                                <span className="absolute inset-0 -translate-x-full animate-[shimmer_3.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
                                <span className="relative">{badgeText}</span>
                            </span>
                        </motion.div>

                        {/* Heading — word-by-word stagger */}
                        <h1 className="text-white text-[42px] sm:text-[54px] md:text-[64px] lg:text-[72px] font-light leading-[1.05] tracking-tight mb-6 md:mb-8">
                            <span className="block overflow-hidden">
                                {line1Words.map((word, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block mr-[0.3em]"
                                        initial={{ y: '120%', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            duration: 0.85,
                                            delay: 0.65 + i * 0.1,
                                            ease: [0.33, 1, 0.68, 1],
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </span>
                            <span className="block overflow-hidden">
                                {line2Words.map((word, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block mr-[0.3em]"
                                        initial={{ y: '120%', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            duration: 0.85,
                                            delay: 0.95 + i * 0.1,
                                            ease: [0.33, 1, 0.68, 1],
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        {/* Animated horizontal rule */}
                        <motion.div
                            className="h-px bg-gradient-to-r from-white/40 via-white/15 to-transparent mb-6 md:mb-7 max-w-sm"
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.2, delay: 1.25, ease: [0.33, 1, 0.68, 1] }}
                        />

                        {/* Description */}
                        <motion.p
                            className="text-white/60 text-sm md:text-[15px] leading-relaxed max-w-md mb-8 md:mb-10"
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 1.35, ease: 'easeOut' }}
                        >
                            {description}
                        </motion.p>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4 md:gap-5">
                            <motion.a
                                href={primaryCtaHref}
                                className="relative bg-white text-[#0d0b0f] rounded-full px-7 py-3 text-[14px] font-semibold overflow-hidden group/btn shadow-xl shadow-white/10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 1.55 }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                <span className="relative z-10">
                                    {primaryCtaLabel}
                                </span>
                            </motion.a>

                            <motion.a
                                href={secondaryCtaHref}
                                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white rounded-full px-6 py-3 text-[14px] font-medium transition-all duration-300 group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 1.7 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {secondaryCtaLabel}
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
                                    <Play size={10} fill="white" strokeWidth={0} className="ml-px" />
                                </span>
                            </motion.a>
                        </div>
                    </div>
                </div>

                {/* ─── Bottom Bar ─── */}
                <div className="w-full px-6 md:px-12 lg:px-20 pb-6 md:pb-8 flex items-end justify-between border-t border-white/10 pt-4">
                    <div className="text-xs text-slate-500 font-mono">FastAPI + LangGraph + Supabase pgvector</div>

                    {/* Achievement text with avatar stack */}
                    <motion.div
                        className="flex items-center gap-3 md:gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 2 }}
                    >
                        <div className="flex -space-x-2">
                            {["wm_alex.png", "wm_olivia.png", "wm_mia.png"].map((i) => (
                                <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#0d0b0f] bg-white/10 backdrop-blur-md overflow-hidden relative">
                                    <img 
                                        src={`https://assets.watermelon.sh/${i}`} 
                                        alt="User avatar" 
                                        className="absolute inset-0 h-full w-full object-cover opacity-80" 
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-white/50 text-[13px] md:text-[14px] font-medium tracking-wide">
                            {achievementText}
                        </p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
