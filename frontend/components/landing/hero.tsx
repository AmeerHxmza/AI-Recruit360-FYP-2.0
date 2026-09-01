"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden bg-[#08090B] flex items-center min-h-[85vh]">
      {/* Full Background Image Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Image
          src="/images/hero-ai-recruitment.png"
          alt="AI-Recruit360 Recruitment Intelligence Background"
          fill
          priority
          className="object-cover object-[80%_center] opacity-80 sm:opacity-90"
          sizes="100vw"
        />
        {/* Left-to-right gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/90 to-transparent w-full lg:w-3/4" />
        {/* Top & bottom gradient overlays to merge seamlessly with section edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090B] via-transparent to-[#08090B]" />
        {/* Ambient cyan glow highlight on right */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[600px] h-[600px] bg-[#39D9FF]/[0.1] blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl text-left space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-[#39D9FF]/30 text-[#39D9FF] text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(57,217,255,0.15)] animate-stagger-1">
            <Sparkles className="h-3.5 w-3.5 text-[#39D9FF]" />
            <span>AI-POWERED RECRUITMENT</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F7FA] font-display leading-[1.05]">
            Screen. Assess. Interview. <br />
            <span className="text-[#39D9FF]">Hire smarter.</span>
          </h1>

          {/* Supporting text */}
          <p className="text-[#A7AFBC] text-base sm:text-lg md:text-xl font-sans leading-relaxed max-w-xl">
            AI-Recruit360 automates the first-round candidate journey—from CV screening and technical assessments to AI interviews and evidence-based candidate intelligence.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-4 animate-stagger-3">
            <Link
              href="/signup"
              className="px-8 py-4 text-sm font-bold text-[#08090B] bg-[#39D9FF] hover:bg-[#63E3FF] rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(57,217,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)] hover:shadow-[0_0_30px_rgba(57,217,255,0.5)] hover:-translate-y-1 active:translate-y-0"
            >
              Start Hiring Smarter
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 text-sm font-bold text-[#F5F7FA] glass rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:border-[#39D9FF]/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#39D9FF]/10 active:translate-y-0"
            >
              See How It Works
            </a>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#68717E] font-mono pt-4 border-t border-[#242932]/60 w-full">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#39D9FF]" /> AI CV screening</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#39D9FF]" /> Timed assessments</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#39D9FF]" /> AI interviews</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#39D9FF]" /> Recruiter intelligence</span>
          </div>
        </div>
      </div>
    </section>
  );
}

