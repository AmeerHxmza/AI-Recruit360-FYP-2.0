"use client";

import * as React from "react";
import { Video, MessageSquareCode, Award } from "lucide-react";

export function InterviewSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0D0F12] border-t border-[#242932]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono text-[#39D9FF] uppercase tracking-widest bg-[#39D9FF]/10 px-3 py-1 rounded-full border border-[#39D9FF]/20 mb-4 inline-block">
            AI-Assisted Interviews
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FA] font-display uppercase mt-2 mb-4">
            Make Every Interview <br />
            More Intelligent.
          </h2>
          <p className="text-[#A7AFBC] text-base sm:text-lg leading-relaxed">
            Structured AI-assisted interviews designed to help evaluate technical reasoning, communication, and role-specific capability.
          </p>
        </div>

        {/* AI Interview Mock Window */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#242932] bg-[#12151A] p-4 sm:p-6 shadow-2xl ai-glow-subtle">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#242932]">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#39D9FF]" />
              <span className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
                AI Adaptive Interview Session
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#39D9FF] bg-[#39D9FF]/10 px-2.5 py-0.5 rounded border border-[#39D9FF]/30">
              Candidate: Sophia Chen
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Question & Answer Stream (7 cols) */}
            <div className="lg:col-span-7 bg-[#0D0F12] rounded-xl border border-[#242932] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#68717E] uppercase tracking-wider font-bold">
                  Question 04 / 10
                </span>
                <span className="text-[10px] font-mono text-[#35D07F] bg-[#35D07F]/10 px-2 py-0.5 rounded">
                  System Evaluation Active
                </span>
              </div>

              <div className="p-4 rounded-lg bg-[#171B21] border border-[#242932]">
                <p className="text-sm font-medium text-[#F5F7FA] font-sans">
                  &quot;How would you design a production RAG system for an enterprise application?&quot;
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#12151A] border border-[#39D9FF]/20 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#39D9FF]">
                  <span className="flex items-center gap-1.5">
                    <MessageSquareCode className="h-3.5 w-3.5" /> Candidate Response Highlights
                  </span>
                  <span>Audio & Transcript Parsed</span>
                </div>
                <p className="text-xs text-[#A7AFBC] leading-relaxed italic">
                  &quot;I would implement a hybrid retrieval approach combining dense vector embeddings with sparse keyword search (BM25) stored in PostgreSQL with pgvector...&quot;
                </p>
              </div>
            </div>

            {/* Evaluation Score Metrics (5 cols) */}
            <div className="lg:col-span-5 bg-[#0D0F12] rounded-xl border border-[#242932] p-5 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-[#F5F7FA] font-bold block mb-4 border-b border-[#242932] pb-2">
                  Real-time AI Assessment
                </span>

                <div className="space-y-4">
                  {[
                    { label: "Technical Depth", value: 92 },
                    { label: "Reasoning & Logic", value: 89 },
                    { label: "Communication Clarity", value: 91 },
                  ].map((score) => (
                    <div key={score.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#A7AFBC]">{score.label}</span>
                        <span className="text-[#39D9FF] font-mono font-bold">
                          {score.value}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[#171B21] rounded-full overflow-hidden border border-[#242932]">
                        <div
                          className="h-full bg-[#39D9FF] rounded-full"
                          style={{ width: `${score.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#171B21] border border-[#35D07F]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#35D07F]" />
                  <span className="text-xs font-mono font-bold text-[#F5F7FA]">
                    Assessment Status
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#35D07F]">
                  PASSED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
