"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  Activity, 
  Check,
  X,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  BarChart3
} from "lucide-react";
import { CandidateIntelligence } from "@/lib/services/candidate-intelligence-service";
import { updateApplicationStatusAction } from "@/app/actions/applications";
import { ApplicationStatus } from "@/types/database.types";
import { useRouter } from "next/navigation";

interface CandidateIntelligencePanelProps {
  intelligence: CandidateIntelligence | null;
  onStatusChange?: () => void;
}

// Helper component to safely parse and render JSON evidence arrays
function JsonEvidenceRenderer({ evidence, isItalic = false }: { evidence: string; isItalic?: boolean }) {
  if (!evidence) return null;
  
  try {
    const parsed = JSON.parse(evidence);
    
    // If it's an array of evidence items
    if (Array.isArray(parsed)) {
      return (
        <ul className="space-y-1.5 mt-2">
          {parsed.map((item, idx) => {
            // Handle EvidenceMatch objects (cv screening)
            if (typeof item === 'object' && item !== null) {
              const text = item.evidence_quote || item.requirement || JSON.stringify(item);
              return (
                <li key={idx} className={`text-xs text-[#A7AFBC] flex gap-2 items-start ${isItalic ? 'italic' : ''}`}>
                  <Check className="w-3 h-3 text-[#39D9FF] shrink-0 mt-0.5" /> 
                  <span className="leading-relaxed">{text}</span>
                </li>
              );
            }
            // Handle plain string arrays (final evaluation)
            return (
              <li key={idx} className={`text-xs text-[#A7AFBC] flex gap-2 items-start ${isItalic ? 'italic' : ''}`}>
                <Check className="w-3 h-3 text-[#39D9FF] shrink-0 mt-0.5" /> 
                <span className="leading-relaxed">{String(item)}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    
    // If it's a JSON object but not an array, stringify it nicely
    if (typeof parsed === 'object' && parsed !== null) {
      return <p className={`text-xs text-[#A7AFBC] leading-relaxed ${isItalic ? 'italic' : ''}`}>{JSON.stringify(parsed, null, 2)}</p>;
    }
  } catch (e) {
    // Not valid JSON, just render as text
  }

  return (
    <p className={`text-xs text-[#A7AFBC] leading-relaxed ${isItalic ? 'italic' : ''}`}>
      {isItalic ? `"${evidence}"` : evidence}
    </p>
  );
}

export function CandidateIntelligencePanel({ intelligence, onStatusChange }: CandidateIntelligencePanelProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!intelligence || !intelligence.application) {
    return (
      <Card className="p-6 border-[#242932] bg-[#12151A] space-y-3">
        <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
          <Sparkles className="h-4 w-4 text-[#A7AFBC]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            AI Evaluation Intelligence
          </h3>
        </div>
        <p className="text-xs text-[#A7AFBC] leading-relaxed">
          Candidate has not applied for any active jobs yet. No AI intelligence available.
        </p>
      </Card>
    );
  }

  const { application, cvScreening, assessment, interview, finalEvaluation } = intelligence;

  const handleDecision = async (status: ApplicationStatus) => {
    if (!application?.id || isUpdating) return;
    setIsUpdating(true);
    const res = await updateApplicationStatusAction(application.id, status);
    if (res.success) {
      if (onStatusChange) onStatusChange();
      router.refresh();
    }
    setIsUpdating(false);
  };

  const formatTimelineDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Summary */}
      <Card className="p-6 border-[#242932] bg-[#12151A] shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#A7AFBC] uppercase tracking-wider font-mono">Overall Composite Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-display text-[#39D9FF]">
                {finalEvaluation?.overallScore || "—"}
              </span>
              <span className="text-sm font-mono font-medium text-[#68717E]">/ 100</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-[#242932] pt-4 md:pt-0 md:pl-6">
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-mono">CV Match (40%)</span>
              <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] font-mono">
                {cvScreening ? `${cvScreening.matchScore}%` : "—"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-mono">Assessment (25%)</span>
              <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] font-mono">
                {assessment ? `${assessment.score}%` : "—"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-mono">Interview (35%)</span>
              <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] font-mono">
                {interview?.overallScore != null ? `${interview.overallScore}%` : "—"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Intelligence Detail Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 2. CV Screening */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#39D9FF]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  CV Screening
                </h3>
              </div>
              {cvScreening && <span className="text-sm font-bold text-[#F5F7FA]">{cvScreening.matchScore}% Match</span>}
            </div>
            
            {cvScreening ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#35D07F] flex items-center gap-1 uppercase font-semibold">
                      <CheckCircle2 className="h-3 w-3" /> Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cvScreening.matchedSkills.length > 0 ? cvScreening.matchedSkills.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-[#35D07F]/10 text-[#35D07F] border-[#35D07F]/20">{s}</Badge>
                      )) : <span className="text-xs text-[#68717E]">None</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#FF5C67] flex items-center gap-1 uppercase font-semibold">
                      <XCircle className="h-3 w-3" /> Missing / Weak Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cvScreening.missingSkills.length > 0 ? cvScreening.missingSkills.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-[#FF5C67]/10 text-[#FF5C67] border-[#FF5C67]/20">{s}</Badge>
                      )) : <span className="text-xs text-[#68717E]">None</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-[#171B21]/50 p-4 rounded-xl border border-[#242932]">
                  <h4 className="text-[10px] font-bold text-[#F5F7FA] uppercase tracking-wider">AI Recommendation & Evidence</h4>
                  <Badge variant={cvScreening.matchScore >= 70 ? "success" : "danger"} className="mb-2 uppercase text-[9px] font-bold">
                    {cvScreening.recommendation.replace('_', ' ')}
                  </Badge>
                  <JsonEvidenceRenderer evidence={cvScreening.evidence} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#68717E]">CV screening not completed.</p>
            )}
          </Card>

          {/* 3. Assessment */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#F5B942]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  Technical Assessment
                </h3>
              </div>
              {assessment && <span className="text-sm font-bold text-[#F5F7FA]">{assessment.score}% Score</span>}
            </div>
            
            {assessment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm font-medium text-[#A7AFBC] mb-4">
                  <span className="flex items-center gap-1 text-[#35D07F]"><Check className="w-4 h-4" /> {assessment.correctAnswers} Correct</span>
                  <span className="flex items-center gap-1 text-[#FF5C67]"><X className="w-4 h-4" /> {(assessment.totalQuestions || 10) - assessment.correctAnswers} Incorrect/Missed</span>
                </div>
                
                {assessment.questions && assessment.questions.length > 0 ? (
                  <div className="space-y-3">
                    {assessment.questions.map((q, idx) => (
                      <div key={idx} className="p-3 bg-[#0D0F12] border border-[#242932] rounded-lg space-y-2">
                        <div className="flex gap-3">
                          <div className="mt-0.5">
                            {q.isCorrect === true ? (
                              <CheckCircle2 className="w-4 h-4 text-[#35D07F]" />
                            ) : q.isCorrect === false ? (
                              <XCircle className="w-4 h-4 text-[#FF5C67]" />
                            ) : (
                              <HelpCircle className="w-4 h-4 text-[#F5B942]" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-[#F5F7FA] font-medium leading-relaxed">{q.questionText}</p>
                            <p className="text-xs mt-1">
                              <span className="text-[#68717E]">Candidate chose: </span>
                              <span className={q.isCorrect ? "text-[#35D07F]" : "text-[#FF5C67]"}>
                                {q.selectedOption ? `Option ${q.selectedOption}` : "Unanswered"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#68717E] italic">Question data not available.</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#68717E]">Assessment not completed.</p>
            )}
          </Card>

          {/* 4. AI Interview */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#242932] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#35D07F]" />
                <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                  AI Voice Interview
                </h3>
              </div>
              {interview && <span className="text-sm font-bold text-[#F5F7FA]">{interview.overallScore != null ? `${interview.overallScore}% Score` : "Pending"}</span>}
            </div>
            
            {interview ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Technical</span>
                    <div className="text-lg font-bold text-[#F5F7FA]">{interview.technicalScore != null ? `${interview.technicalScore}%` : "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Communication</span>
                    <div className="text-lg font-bold text-[#F5F7FA]">{interview.communicationScore != null ? `${interview.communicationScore}%` : "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Relevance</span>
                    <div className="text-lg font-bold text-[#F5F7FA]">{interview.relevanceScore != null ? `${interview.relevanceScore}%` : "—"}</div>
                  </div>
                </div>

                <div className="space-y-2 bg-[#171B21]/50 p-4 rounded-xl border border-[#242932]">
                  <h4 className="text-[10px] font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-[#39D9FF]" /> AI Overall Feedback
                  </h4>
                  <p className="text-xs text-[#A7AFBC] leading-relaxed">
                    {interview.feedback || "Feedback will be generated upon interview completion."}
                  </p>
                </div>

                {interview.responses && interview.responses.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-[#F5F7FA] uppercase tracking-wider">Interview Transcript</h4>
                    {interview.responses.map((r, idx) => (
                      <div key={idx} className="space-y-2 bg-[#0D0F12] border border-[#242932] p-4 rounded-lg">
                        <div className="flex gap-3">
                          <MessageSquare className="w-4 h-4 text-[#39D9FF] shrink-0 mt-0.5" />
                          <p className="text-xs text-[#F5F7FA] font-medium leading-relaxed">{r.questionText}</p>
                        </div>
                        <div className="flex gap-3 pl-7">
                          <p className="text-xs text-[#A7AFBC] italic leading-relaxed">&quot;{r.responseText}&quot;</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#68717E]">Interview not completed.</p>
            )}
          </Card>
        </div>

        {/* Right Column: Timeline & Recruiter Actions */}
        <div className="space-y-6">
          
          {/* 5. Final Evaluation */}
          <Card className="p-6 border-[#39D9FF]/30 bg-[#39D9FF]/5 space-y-5 shadow-lg relative">
            <div className="flex items-center gap-2 border-b border-[#39D9FF]/20 pb-3">
              <BarChart3 className="h-4 w-4 text-[#39D9FF]" />
              <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
                Final Evaluation
              </h3>
            </div>
            
            {finalEvaluation ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Recommendation</h4>
                  <Badge 
                    variant={finalEvaluation.recommendation === "strong_hire" ? "success" : finalEvaluation.recommendation === "hire" ? "ai" : finalEvaluation.recommendation === "review" ? "warning" : "danger"} 
                    className="text-xs font-bold uppercase py-1 px-3"
                  >
                    {finalEvaluation.recommendation.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider">Key Strengths</h4>
                  <ul className="space-y-1">
                    {finalEvaluation.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-[#F5F7FA] flex gap-2 items-start"><Check className="w-3 h-3 text-[#35D07F] shrink-0 mt-0.5" /> {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider">Risk Indicators</h4>
                  <ul className="space-y-1">
                    {finalEvaluation.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-[#A7AFBC] flex gap-2 items-start"><X className="w-3 h-3 text-[#FF5C67] shrink-0 mt-0.5" /> {w}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#39D9FF]/20">
                  <h4 className="text-[10px] font-bold text-[#A7AFBC] uppercase tracking-wider">AI Reasoning</h4>
                  <JsonEvidenceRenderer evidence={finalEvaluation.evidence} isItalic={true} />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#68717E]">Final evaluation pending.</p>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-6 border-[#242932] bg-[#12151A]">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display mb-4 border-b border-[#242932] pb-3">
              Application Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#242932] before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#12151A] bg-[#242932] text-[#A7AFBC] shrink-0 z-10 font-bold text-[10px]">1</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col md:text-right pl-4 md:pl-0 md:pr-4">
                  <span className="text-[10px] text-[#A7AFBC] uppercase font-bold">Applied</span>
                  <span className="text-[10px] text-[#68717E]">{formatTimelineDate(application.appliedAt)}</span>
                </div>
              </div>

              {cvScreening && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#12151A] bg-[#39D9FF] text-[#06080A] shrink-0 z-10"><Check className="w-3 h-3" /></div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col pl-4 md:pl-4">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-bold">CV Screened</span>
                    <span className="text-[10px] text-[#68717E]">{formatTimelineDate(cvScreening.createdAt)}</span>
                  </div>
                </div>
              )}

              {assessment && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#12151A] bg-[#F5B942] text-[#06080A] shrink-0 z-10"><Check className="w-3 h-3" /></div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col md:text-right pl-4 md:pl-0 md:pr-4">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-bold">Assessment Completed</span>
                    <span className="text-[10px] text-[#68717E]">{formatTimelineDate(assessment.completedAt || assessment.createdAt)}</span>
                  </div>
                </div>
              )}

              {interview && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#12151A] bg-[#35D07F] text-[#06080A] shrink-0 z-10"><Check className="w-3 h-3" /></div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col pl-4 md:pl-4">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-bold">Interview Completed</span>
                    <span className="text-[10px] text-[#68717E]">{formatTimelineDate(interview.completedAt || interview.createdAt)}</span>
                  </div>
                </div>
              )}

              {finalEvaluation && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#12151A] bg-[#39D9FF] text-[#08090B] shrink-0 z-10"><Check className="w-3 h-3 font-bold" /></div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] flex flex-col md:text-right pl-4 md:pl-0 md:pr-4">
                    <span className="text-[10px] text-[#A7AFBC] uppercase font-bold">Evaluation Generated</span>
                    <span className="text-[10px] text-[#68717E]">{formatTimelineDate(finalEvaluation.createdAt)}</span>
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* Recruiter Decision */}
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4 shadow-2xl sticky top-24">
            <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display border-b border-[#242932] pb-3">
              Recruiter Decision
            </h3>
            
            <div className="space-y-3 pt-2">
              <Button 
                variant="primary" 
                className="w-full justify-between"
                disabled={isUpdating || application.status === "shortlisted"}
                onClick={() => handleDecision("shortlisted")}
              >
                <span>Shortlist Candidate</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-between hover:bg-[#39D9FF]/10 hover:text-[#39D9FF] hover:border-[#39D9FF]/30"
                disabled={isUpdating || application.status === "evaluation"}
                onClick={() => handleDecision("evaluation")}
              >
                <span>Move to Review</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="danger" 
                className="w-full justify-between"
                disabled={isUpdating || application.status === "rejected" || application.status === "knocked_out"}
                onClick={() => handleDecision("rejected")}
              >
                <span>Reject Candidate</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="pt-2">
              <p className="text-[10px] text-[#68717E] text-center italic">
                Current Status: <span className="font-bold text-[#A7AFBC] uppercase">{application.status.replace('_', ' ')}</span>
              </p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
