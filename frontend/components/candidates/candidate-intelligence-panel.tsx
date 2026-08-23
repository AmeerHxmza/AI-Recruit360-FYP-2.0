import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, CheckCircle2, XCircle, BrainCircuit, Activity, BarChart3, AlertCircle } from "lucide-react";
import { CandidateIntelligence } from "@/lib/services/candidate-intelligence-service";

interface CandidateIntelligencePanelProps {
  intelligence: CandidateIntelligence | null;
}

export function CandidateIntelligencePanel({ intelligence }: CandidateIntelligencePanelProps) {
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

  const { cvScreening, assessment, interview, finalEvaluation } = intelligence;

  return (
    <div className="space-y-6">
      {/* Compact Score Summary */}
      <Card className="p-5 border-[#242932] bg-[#12151A]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-semibold">CV Match</span>
            <div className="text-lg font-bold text-[#F5F7FA] font-display">
              {cvScreening ? `${cvScreening.matchScore}%` : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-semibold">Assessment</span>
            <div className="text-lg font-bold text-[#F5F7FA] font-display">
              {assessment ? `${assessment.score} / ${assessment.totalQuestions || 10}` : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-semibold">Interview</span>
            <div className="text-lg font-bold text-[#F5F7FA] font-display">
              {interview?.overallScore != null ? `${interview.overallScore}%` : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-[#A7AFBC] uppercase tracking-wider font-semibold">Overall</span>
            <div className="text-lg font-bold text-[#39D9FF] font-display">
              {finalEvaluation ? `${finalEvaluation.overallScore} / 100` : "—"}
            </div>
          </div>
        </div>
      </Card>

      {/* CV Analysis */}
      <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
          <FileText className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            CV Analysis
          </h3>
        </div>
        
        {cvScreening ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-[#1C2027]">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Skills Score</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{cvScreening.skillsScore || 0}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Experience Score</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{cvScreening.experienceScore || 0}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Education Score</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{cvScreening.educationScore || 0}%</div>
              </div>
            </div>

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

            <div className="pt-2">
              <h4 className="text-[11px] font-bold text-[#F5F7FA] mb-1">Evidence & AI Recommendation</h4>
              <p className="text-xs text-[#A7AFBC] leading-relaxed mb-2">{cvScreening.evidence}</p>
              <Badge variant={cvScreening.matchScore >= 70 ? "success" : "danger"} className="text-[10px]">
                {cvScreening.recommendation}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#68717E]">CV screening not completed.</p>
        )}
      </Card>

      {/* Assessment */}
      <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
          <BrainCircuit className="h-4 w-4 text-[#F5B942]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            Assessment
          </h3>
        </div>
        
        {assessment ? (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Assessment Score</span>
              <div className="text-lg font-bold text-[#F5B942] font-display">
                {assessment.score} / {assessment.totalQuestions || 10}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Correct Answers</span>
              <div className="text-sm font-bold text-[#F5F7FA]">{assessment.correctAnswers}</div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Questions</span>
              <div className="text-sm font-bold text-[#F5F7FA]">{assessment.totalQuestions || 10}</div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#68717E]">Assessment not completed.</p>
        )}
      </Card>

      {/* AI Interview */}
      <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
          <Activity className="h-4 w-4 text-[#35D07F]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            AI Interview
          </h3>
        </div>
        
        {interview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-[#1C2027]">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Interview Status</span>
                <div className="text-sm font-bold text-[#F5F7FA] capitalize">{interview.status}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Interview Score</span>
                <div className="text-sm font-bold text-[#35D07F]">{interview.overallScore != null ? `${interview.overallScore}%` : "—"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Technical Score</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{interview.technicalScore != null ? `${interview.technicalScore}%` : "—"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Communication Score</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{interview.communicationScore != null ? `${interview.communicationScore}%` : "—"}</div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-[11px] font-bold text-[#F5F7FA] mb-1">AI Feedback</h4>
              <p className="text-xs text-[#A7AFBC] leading-relaxed italic border-l-2 border-[#35D07F]/40 pl-3 py-1 bg-[#171B21]/50">
                {interview.feedback || "Feedback will be generated upon interview completion."}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#68717E]">Interview not completed.</p>
        )}
      </Card>

      {/* Final Evaluation */}
      <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#242932] pb-3">
          <BarChart3 className="h-4 w-4 text-[#39D9FF]" />
          <h3 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider font-display">
            Final Evaluation
          </h3>
        </div>
        
        {finalEvaluation ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-[#1C2027]">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Overall Score</span>
                <div className="text-lg font-bold text-[#39D9FF] font-display">{finalEvaluation.overallScore} / 100</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">CV Weight</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{finalEvaluation.cvWeight}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Assessment Weight</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{finalEvaluation.assessmentWeight}%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A7AFBC] uppercase font-semibold">Interview Weight</span>
                <div className="text-sm font-bold text-[#F5F7FA]">{finalEvaluation.interviewWeight}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-[#F5F7FA] uppercase tracking-wider">AI Recommendation & Evidence</h4>
                <p className="text-xs text-[#A7AFBC] leading-relaxed bg-[#171B21]/50 p-3 rounded-lg border border-[#242932]">
                  <strong className="block mb-1 text-[#39D9FF]">{finalEvaluation.recommendation}</strong>
                  {finalEvaluation.evidence}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-[#F5F7FA] uppercase tracking-wider">Recruiter Decision</h4>
                <div className="bg-[#0D0F12] p-4 rounded-lg border border-[#242932] flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-[#68717E]" />
                  <span className="text-xs text-[#A7AFBC]">Waiting for recruiter review to shortlist or reject.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#68717E]">Final evaluation not completed.</p>
        )}
      </Card>
    </div>
  );
}
