"use client";

import * as React from "react";
import { ShieldAlert, ShieldCheck, AlertTriangle, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AntiCheatBannerProps {
  violationCount: number;
  maxViolations?: number;
}

export function AntiCheatStatusBadge({
  violationCount,
  maxViolations = 3,
}: AntiCheatBannerProps) {
  const isClean = violationCount === 0;

  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary shadow-sm">
      {isClean ? (
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
      ) : (
        <ShieldAlert className="h-3.5 w-3.5 text-danger animate-pulse" />
      )}
      <span className="font-medium">
        {isClean ? (
          <span className="text-text-primary">Anti-Cheat Active (Protected)</span>
        ) : (
          <span className="text-danger font-semibold">
            Integrity Flags: {violationCount}/{maxViolations}
          </span>
        )}
      </span>
      <span className="hidden sm:inline text-text-muted">· Copying & Tab-Switching Monitored</span>
    </div>
  );
}

interface AntiCheatModalProps {
  isOpen: boolean;
  message: string | null;
  violationCount: number;
  maxViolations?: number;
  onDismiss: () => void;
}

export function AntiCheatWarningModal({
  isOpen,
  message,
  violationCount,
  maxViolations = 3,
  onDismiss,
}: AntiCheatModalProps) {
  if (!isOpen) return null;

  const isCritical = violationCount >= maxViolations;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-danger/30 bg-surface p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Anti-Cheat Integrity Alert
            </h3>
            <p className="text-xs font-semibold uppercase tracking-wider text-danger">
              Violation {violationCount} of {maxViolations}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-hover/40 p-3.5 text-xs text-text-secondary leading-relaxed space-y-2">
          <p className="font-semibold text-text-primary">
            {message || "An unauthorized navigation or clipboard event was detected."}
          </p>
          <p>
            This evaluation session is strictly monitored. All window blur events, tab switches, and clipboard attempts are timestamped and permanently attached to your candidate profile for recruiter review.
          </p>
          {isCritical ? (
            <p className="font-bold text-danger">
              ⚠️ Maximum violation threshold reached. Continued violations will result in automatic submission and immediate disqualification.
            </p>
          ) : (
            <p className="text-text-muted">
              Remaining allowed warnings: <strong className="text-text-primary">{maxViolations - violationCount}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Lock className="h-3.5 w-3.5" />
            <span>Server Audit Active</span>
          </div>
          <Button
            variant={isCritical ? "danger" : "primary"}
            size="sm"
            onClick={onDismiss}
            className="px-4 font-semibold text-xs"
          >
            I Understand, Resume Test
          </Button>
        </div>
      </div>
    </div>
  );
}
