"use client";

import * as React from "react";
import { ApplicationShell } from "@/components/layout/application-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { getAiActivityLogsAction } from "@/app/actions/ai-activity";
import { AiActivityLog } from "@/lib/services/ai-activity-service";
import { Cpu, Sparkles, Database, FileText, Video, Loader2, AlertCircle, RefreshCw } from "lucide-react";

export default function AiActivityPage() {
  const { organization } = useAuth();
  const [logs, setLogs] = React.useState<AiActivityLog[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
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

  React.useEffect(() => {
    let isMounted = true;
    getAiActivityLogsAction(50).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data) {
        setLogs(res.data);
      } else {
        setErrorMsg(res.error || "Failed to load AI activity event stream.");
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [organization?.id]);

  const filteredLogs = React.useMemo(() => {
    if (categoryFilter === "All") return logs;
    return logs.filter((log) => {
      const type = log.event_type.toLowerCase();
      if (categoryFilter === "Resume Analysis") return type.includes("resume") || type.includes("document");
      if (categoryFilter === "RAG Retrieval") return type.includes("rag") || type.includes("retrieval") || type.includes("embedding");
      if (categoryFilter === "Candidate Matching") return type.includes("match") || type.includes("candidate");
      if (categoryFilter === "Interview") return type.includes("interview");
      if (categoryFilter === "Evaluation") return type.includes("evaluation") || type.includes("score");
      return true;
    });
  }, [logs, categoryFilter]);

  const getCategoryIcon = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes("resume") || type.includes("document")) {
      return <FileText className="h-4 w-4 text-[#39D9FF]" />;
    }
    if (type.includes("rag") || type.includes("retrieval") || type.includes("embedding")) {
      return <Database className="h-4 w-4 text-[#63E3FF]" />;
    }
    if (type.includes("match") || type.includes("candidate")) {
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
        return <Badge variant="ai" className="text-[10px] uppercase font-mono">Processing</Badge>;
    }
  };

  return (
    <ApplicationShell pageBreadcrumb={[organization?.name || "AI-Recruit360", "AI Activity Console"]}>
      <PageHeader
        title="AI Activity Console"
        description="Real-time stream of background AI agent operations, vector retrieval, and automated evaluations."
        badge={
          <Badge variant="ai" className="px-3 py-1">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39D9FF] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39D9FF]" />
            </span>
            Agentic Engine Active
          </Badge>
        }
        actions={
          <Button variant="secondary" size="sm" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh Log
          </Button>
        }
      />

      {/* Error Banner */}
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

      {/* Category Filter Pills */}
      <Section className="my-0 mb-6">
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-[#242932] bg-[#12151A]">
          {["All", "Resume Analysis", "RAG Retrieval", "Candidate Matching", "Interview", "Evaluation"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-micro focus:outline-none ${
                categoryFilter === cat
                  ? "bg-[#171B21] text-[#39D9FF] border border-[#39D9FF]/40 font-semibold"
                  : "text-[#A7AFBC] hover:text-[#F5F7FA] hover:bg-[#171B21]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Section>

      {/* Event Activity Stream Timeline */}
      <Section title="Live AI Operational Event Stream">
        {loading ? (
          <div className="p-12 text-center rounded-xl border border-[#242932] bg-[#12151A] space-y-4">
            <Loader2 className="h-8 w-8 text-[#39D9FF] animate-spin mx-auto" />
            <p className="text-xs text-[#A7AFBC] font-mono">Loading activity log stream from database...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 sm:p-16 text-center rounded-2xl border border-[#242932] bg-[#0D0F12] space-y-4">
            <Cpu className="h-10 w-10 text-[#39D9FF] mx-auto opacity-80" />
            <h3 className="text-base font-bold text-[#F5F7FA]">No AI activity logs recorded</h3>
            <p className="text-xs text-[#A7AFBC] max-w-sm mx-auto">
              AI agent operations (document ingestion, RAG searches, evaluation scoring) will automatically stream here.
            </p>
          </div>
        ) : (
          <Card className="p-6 border-[#242932] bg-[#12151A] space-y-4">
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-[#0D0F12] border border-[#1C2027] transition-micro hover:border-[#39D9FF]/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#171B21] border border-[#242932]">
                    {getCategoryIcon(log.event_type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F7FA] font-mono">{log.event_type}</span>
                        {getStatusBadge(log.status)}
                      </div>
                      <span className="text-[11px] font-mono text-[#68717E]">{formatDate(log.created_at)}</span>
                    </div>

                    <div className="text-xs text-[#A7AFBC] flex flex-wrap items-center gap-2 pt-0.5">
                      {(log as unknown as { entity_type?: string; entity_id?: string }).entity_type && (
                        <span className="text-[10px] font-mono bg-[#171B21] px-2 py-0.5 rounded border border-[#242932]">
                          Entity: {(log as unknown as { entity_type?: string }).entity_type} ({(log as unknown as { entity_id?: string }).entity_id ? (log as unknown as { entity_id?: string }).entity_id!.slice(0, 8) : "N/A"})
                        </span>
                      )}
                      {log.metadata && typeof log.metadata === "object" && (
                        <span className="text-[10px] text-[#68717E] font-mono truncate max-w-md">
                          {JSON.stringify(log.metadata)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Section>
    </ApplicationShell>
  );
}
