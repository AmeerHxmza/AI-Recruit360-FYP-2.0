"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}
export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const id = React.useId();
  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cn(
        "w-[calc(100%_-_2rem)] p-6",
        { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" }[
          maxWidth
        ],
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id={`${id}-title`} className="text-lg font-semibold">
            {title || "Details"}
          </h2>
          {description && (
            <p
              id={`${id}-description`}
              className="mt-2 text-sm text-text-secondary"
            >
              {description}
            </p>
          )}
        </div>
        <button
          aria-label="Close dialog"
          onClick={onClose}
          className="rounded p-1 hover:bg-hover"
        >
          <X className="size-5" />
        </button>
      </div>
      {children}
      {footer && (
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
