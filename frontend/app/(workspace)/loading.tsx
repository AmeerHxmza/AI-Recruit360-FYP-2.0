import { Loader2 } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-surface border border-border"
          />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-surface border border-border flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
          <Loader2 className="h-4 w-4 text-action-blue animate-spin" />
          <span>Loading workspace data...</span>
        </div>
      </div>
    </div>
  );
}
