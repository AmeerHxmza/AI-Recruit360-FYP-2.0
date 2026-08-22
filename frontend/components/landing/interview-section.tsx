"use client";

import * as React from "react";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

export function InterviewSection() {
  return (
    <section id="interview" className="py-20 md:py-28 bg-[#0D0F12] border-t border-[#242932]/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Image Frame */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0D0F12]">
              <Image
                src="/images/feature-ai-interview.png"
                alt="AI-Recruit360 AI Interview Interface"
                fill
                className="object-cover"
                sizes="(max-width: 1000px) 100vw, 600px"
              />
            </div>
          </div>

          {/* Right Column: AI Interview & Adaptive Logic Description */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3.5 py-1 rounded-full border border-[#39D9FF]/20 inline-block">
              03 — ADAPTIVE AI VIDEO INTERVIEW
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display">
              Professional, automated first-round interviews.
            </h2>
            <p className="text-[#A7AFBC] text-base leading-relaxed">
              AI-Recruit360 conducts calm, structured interviews. As the candidate answers, the AI analyzes reasoning depth and asks relevant follow-up questions tailored to their specific claims.
            </p>

            {/* Adaptive Interview Visual Flow Box */}
            <div className="p-5 rounded-2xl bg-[#12151A] border border-[#242932] space-y-4">
              <div className="flex items-center justify-between border-b border-[#242932] pb-3 text-xs">
                <span className="font-bold text-[#F5F7FA] font-display flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#39D9FF]" /> Adaptive Interview Engine
                </span>
                <span className="font-mono text-[#39D9FF] text-[11px]">Question 3 of 8</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0D0F12] border border-[#242932]">
                  <span className="text-[10px] font-mono text-[#A7AFBC] uppercase block mb-1">Candidate Answer</span>
                  <p className="text-[#F5F7FA] font-sans italic">
                    &quot;We designed a RAG architecture using hybrid vector search for our search engine...&quot;
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-4 w-4 text-[#39D9FF] rotate-90" />
                </div>

                <div className="p-3 rounded-lg bg-[#171B21] border border-[#39D9FF]/40">
                  <span className="text-[10px] font-mono text-[#39D9FF] uppercase block mb-1">AI Adaptive Follow-up Question</span>
                  <p className="text-[#F5F7FA] font-semibold">
                    &quot;How did you handle retrieval quality and hallucination control when latency limits were exceeded?&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

