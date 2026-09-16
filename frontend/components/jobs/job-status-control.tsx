"use client";

import * as React from "react";
import { updateJobAction } from "@/app/actions/jobs";
import { JobStatus } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, XCircle, PauseCircle, PlayCircle } from "lucide-react";

interface JobStatusControlProps {
  jobId: string;
  initialStatus: JobStatus;
  canManage: boolean;
}

export function JobStatusControl({
  jobId,
  initialStatus,
  canManage,
}: JobStatusControlProps) {
  const [status, setStatus] = React.useState<JobStatus>(initialStatus);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!canManage || loading || newStatus === status) return;

    setLoading(true);
    setError(null);

    try {
      const res = await updateJobAction(jobId, { status: newStatus });
      if (res.success && res.data) {
        setStatus(res.data.status);
      } else {
        setError(res.error || "Failed to update status.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 text-xs font-medium px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Accepting Applications (Active)
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 gap-1.5 text-xs font-medium px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-zinc-400" />
            Closed (Not Accepting)
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1.5 text-xs font-medium px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Paused (On Hold)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1.5 text-xs font-medium px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Draft
          </Badge>
        );
    }
  };

  if (!canManage) {
    return getStatusBadge();
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {getStatusBadge()}

      <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-0.5">
        {status !== "active" ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => handleStatusChange("active")}
            className="h-7 px-2.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
            title="Open job to accept applications"
          >
            {loading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <PlayCircle className="size-3.5" />
            )}
            Open Job
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => handleStatusChange("closed")}
            className="h-7 px-2.5 text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 gap-1"
            title="Stop accepting applications"
          >
            {loading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <XCircle className="size-3.5" />
            )}
            Close Job
          </Button>
        )}

        {status === "active" && (
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => handleStatusChange("paused")}
            className="h-7 px-2 text-xs text-zinc-500 hover:text-amber-600 hover:bg-amber-50 gap-1"
            title="Temporarily pause intake"
          >
            <PauseCircle className="size-3.5" />
            Pause
          </Button>
        )}
      </div>

      {error && <span className="text-xs text-red-500 font-sans">{error}</span>}
    </div>
  );
}
