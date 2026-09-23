"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface AntiCheatViolation {
  type: "TAB_SWITCH" | "WINDOW_BLUR" | "COPY_ATTEMPT" | "PASTE_ATTEMPT" | "DEVTOOLS_ATTEMPT";
  timestamp: string;
  message: string;
}

export interface AntiCheatOptions {
  enabled?: boolean;
  sessionId?: string;
  maxViolations?: number;
  blockCopy?: boolean;
  blockPaste?: boolean;
  blockDevTools?: boolean;
  onViolation?: (violation: AntiCheatViolation, totalCount: number) => void;
  onMaxViolationsReached?: () => void;
}

export function useAntiCheat({
  enabled = true,
  sessionId = "default",
  maxViolations = 3,
  blockCopy = true,
  blockPaste = true,
  blockDevTools = true,
  onViolation,
  onMaxViolationsReached,
}: AntiCheatOptions = {}) {
  const [violations, setViolations] = useState<AntiCheatViolation[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isMaxReached, setIsMaxReached] = useState(false);
  const violationCountRef = useRef(0);
  const storageKey = `anticheat:telemetry:${sessionId}`;

  // Restore saved telemetry from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as AntiCheatViolation[];
        if (Array.isArray(parsed)) {
          setViolations(parsed);
          violationCountRef.current = parsed.length;
          if (parsed.length >= maxViolations) {
            setIsMaxReached(true);
          }
        }
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }, [storageKey, maxViolations]);

  const recordViolation = useCallback(
    (type: AntiCheatViolation["type"], message: string) => {
      if (!enabled) return;

      const newViolation: AntiCheatViolation = {
        type,
        timestamp: new Date().toISOString(),
        message,
      };

      setViolations((prev) => {
        const updated = [...prev, newViolation];
        violationCountRef.current = updated.length;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // Ignore storage quota errors
        }

        if (updated.length >= maxViolations) {
          setIsMaxReached(true);
          if (onMaxViolationsReached) {
            onMaxViolationsReached();
          }
        }

        return updated;
      });

      setWarningMessage(message);
      setShowWarningModal(true);

      if (onViolation) {
        onViolation(newViolation, violationCountRef.current + 1);
      }
    },
    [enabled, maxViolations, onViolation, onMaxViolationsReached, storageKey]
  );

  const dismissWarning = useCallback(() => {
    setShowWarningModal(false);
    setWarningMessage(null);
  }, []);

  // 1. Tab Switching & Window Focus Monitoring
  useEffect(() => {
    if (!enabled) return;

    let blurTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation(
          "TAB_SWITCH",
          "Tab switch detected. Navigating away from the active examination window is strictly prohibited."
        );
      }
    };

    const handleWindowBlur = () => {
      // Small debounce to avoid transient blur triggers
      blurTimer = setTimeout(() => {
        if (!document.hasFocus()) {
          recordViolation(
            "WINDOW_BLUR",
            "Window focus lost. Please keep your cursor and attention inside the test environment."
          );
        }
      }, 500);
    };

    const handleWindowFocus = () => {
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      if (blurTimer) clearTimeout(blurTimer);
    };
  }, [enabled, recordViolation]);

  // 2. Clipboard & Context Menu (Right Click) Protection
  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      if (blockCopy) {
        e.preventDefault();
        recordViolation(
          "COPY_ATTEMPT",
          "Right-click context menu is disabled to prevent question scraping."
        );
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (blockCopy) {
        e.preventDefault();
        recordViolation(
          "COPY_ATTEMPT",
          "Copying questions or test content is strictly disabled."
        );
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (blockCopy) {
        e.preventDefault();
        recordViolation(
          "COPY_ATTEMPT",
          "Cutting test content is strictly disabled."
        );
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (blockPaste) {
        const text = e.clipboardData?.getData("text") || "";
        // Flag substantial pastes (>15 chars) as potential external AI text injection
        if (text.trim().length > 15) {
          e.preventDefault();
          recordViolation(
            "PASTE_ATTEMPT",
            "Pasting external text is disabled. Please compose and type your response directly."
          );
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        if (blockCopy) {
          e.preventDefault();
          recordViolation(
            "COPY_ATTEMPT",
            "Keyboard copy shortcut (Ctrl+C) is disabled."
          );
        }
      }

      // Block Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        if (blockPaste) {
          e.preventDefault();
          recordViolation(
            "PASTE_ATTEMPT",
            "Pasting via keyboard (Ctrl+V) is disabled."
          );
        }
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
      }

      // Block F12 and Ctrl+Shift+I (Developer Tools)
      if (
        blockDevTools &&
        (e.key === "F12" ||
          ((e.ctrlKey || e.metaKey) &&
            e.shiftKey &&
            (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")))
      ) {
        e.preventDefault();
        recordViolation(
          "DEVTOOLS_ATTEMPT",
          "Opening developer console or inspecting DOM elements is prohibited."
        );
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, blockCopy, blockPaste, blockDevTools, recordViolation]);

  const getTelemetrySummary = useCallback(() => {
    const tabSwitches = violations.filter((v) => v.type === "TAB_SWITCH").length;
    const windowBlurs = violations.filter((v) => v.type === "WINDOW_BLUR").length;
    const copyAttempts = violations.filter((v) => v.type === "COPY_ATTEMPT").length;
    const pasteAttempts = violations.filter((v) => v.type === "PASTE_ATTEMPT").length;

    return {
      totalViolations: violations.length,
      tabSwitches,
      windowBlurs,
      copyAttempts,
      pasteAttempts,
      isClean: violations.length === 0,
      violations,
    };
  }, [violations]);

  return {
    violations,
    violationCount: violations.length,
    warningMessage,
    showWarningModal,
    isMaxReached,
    dismissWarning,
    recordViolation,
    getTelemetrySummary,
  };
}
