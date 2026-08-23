"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAiActivityLogsAction } from "@/app/actions/ai-activity";
import { AiActivityLog } from "@/lib/services/ai-activity-service";
import { Cpu, Sparkles, Database, FileText, Video, Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface AiActivityClientViewProps {
  initialLogs: AiActivityLog[];
  orgName: string;
}

export function AiActivityClientView({ initialLogs, orgName }: AiActivityClientViewProps) {
  const [logs, setLogs] = React.useState<AiActivityLog[]>(initialLogs);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");

  const loadLogs = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    const res = await getAiActivityLogsAction(50);
    if (res.success && res.data) {
      setLogs(res.data);
    } else {
      setErrorMsg(res.error || "Failed to load AI activity event stream.");
    }
    setLoading(false);
  }, []);

  const filteredLogs = React.useMemo(() => {
    if (categoryFilter === "All") return logs;
    return logs.filter((log) => {
      const type = log.event_type.toLowerCase();
      if (categoryFilter === "Resume Analysis") return type.includes("resume") || type.includes("document") || type.includes("cv");
      if (categoryFilter === "RAG Retrieval") return type.includes("rag") || type.includes("retrieval") || type.includes("embedding");
      if (categoryFilter === "Candidate Matching") return type.includes("match") || type.includes("candidate") || type.includes("screen");
      if (categoryFilter === "Interview") return type.includes("interview");
      if (categoryFilter === "Evaluation") return type.includes("evaluation") || type.includes("score");
      return true;
    });
  }, [logs, categoryFilter]);

  const getCategoryIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes("resume") || type.includes("document") || type.includes("cv")) {
      return <FileText className="h-4 w-4 text-[#39D9FF]" />;
    }
    if (type.includes("rag") || type.includes("retrieval") || type.includes("embedding")) {
      return <Database className="h-4 w-4 text-[#63E3FF]" />;
    }
    if (type.includes("match") || type.includes("candidate") || type.includes("screen")) {
      return <Sparkles className="h-4 w-4 text-[#35D07F]" />;
    }
    if (type.includes("interview")) {
      return <Video className="h-4 w-4 text-[#F5B942]" />;
    }
    return <Cpu className="h-4 w-4 text-[#39D9FF]" />;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success" className="text-[10px] uppercase font-mono">Success</Badge>;
      case "warning":
        return <Badge variant="warning" className="text-[10px] uppercase font-mono">Warning</Badge>;
      case "error":
        return <Badge variant="danger" className="text-[10px] uppercase font-mono">Error</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase font-mono">{status}</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={[orgName || "AI-Recruit360", "AI Activity"]}>
      <PageHeader
        title="AI Engine Event Stream"
        description="Real-time audit log of Gemini LLM agent operations, vector embeddings, and candidate scoring executions."
        badge={
          <Badge variant="ai">
            <Sparkles className="h-3 w-3 mr-1" /> Live Event Stream
          </Badge>
        }
        actions={
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh Stream
          </Button>
        }
      />

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {["All", "Resume Analysis", "RAG Retrieval", "Candidate Matching", "Interview", "Evaluation"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-micro border ${
              categoryFilter === cat
                ? "bg-[#39D9FF]/10 text-[#39D9FF] border-[#39D9FF]/40"
                : "bg-[#12151A] text-[#A7AFBC] border-[#242932] hover:bg-[#171B21] hover:text-[#F5F7FA]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error State */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-[#FF5C67]/10 border border-[#FF5C67]/30 flex items-center justify-between text-xs text-[#FF5C67]">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadLogs} className="text-[#FF5C67]">
            Retry
          </Button>
        </div>
      )}

      {/* Event Stream Activity Log */}
      <Section title="Recorded AI Agent Operations">
        {loading ? (
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Fetching latest AI events...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="p-12 text-center bg-[#12151A] border-[#242932] space-y-4">
            <Cpu className="h-10 w-10 text-[#39D9FF] mx-auto opacity-80" />
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-base font-bold text-[#F5F7FA]">No AI activity events found</h4>
              <p className="text-xs text-[#A7AFBC]">
                Events will appear here automatically when candidate CVs are screened, assessments are generated, or AI interviews take place.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-[#242932] bg-[#12151A] hover:border-[#39D9FF]/30 transition-micro space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0D0F12] border border-[#242932]">
                      {getCategoryIcon(log.event_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F7FA] font-mono">
                          {log.event_type}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>
                      <span className="text-[11px] text-[#A7AFBC] font-mono">
                        Event ID: {log.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#68717E] font-mono">
                    {formatDate(log.created_at)}
                  </span>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-2 p-3 rounded-lg bg-[#0D0F12] border border-[#1C2027] text-[11px] font-mono text-[#A7AFBC] overflow-x-auto">
                    <pre className="whitespace-pre-wrap font-mono leading-relaxed">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </ApplicationShell>
  );
}
