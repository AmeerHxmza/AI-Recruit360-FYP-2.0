"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand/brand-logo";
import { KeyRound, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAFAF7] text-[#121212] px-5 py-12 flex flex-col justify-center">
      <div className="mx-auto max-w-md w-full space-y-6">
        <div className="flex justify-center">
          <BrandLogo href="/" size="md" />
        </div>

        <form
          className="bg-white rounded-[18px] border border-[#E7E7E2] p-8 shadow-sm space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage("");
            if (password !== confirmation) {
              setMessage("Passwords do not match.");
              return;
            }
            setBusy(true);
            try {
              const { error } = await createClient().auth.updateUser({
                password,
              });
              if (error) throw error;
              setSaved(true);
            } catch {
              setMessage(
                "Could not change your password. Request a new recovery link and try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="text-center space-y-1.5">
            <div className="size-11 rounded-xl bg-[#111111]/5 border border-[#E7E7E2] text-[#121212] mx-auto flex items-center justify-center mb-1">
              <KeyRound className="size-5" />
            </div>
            <h1 className="text-2xl font-[550] tracking-tight text-[#121212]">
              Set a new password
            </h1>
            <p className="text-xs text-[#60605D]">
              Choose a strong password with at least 8 characters.
            </p>
          </div>

          {saved ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="size-12 rounded-xl bg-[#ECF9F3] border border-[#35C88A]/30 text-[#167348] mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-6 text-[#35C88A]" />
              </div>
              <p className="text-sm font-medium text-[#121212]">
                Your password has been successfully updated.
              </p>
              <Link
                className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 mt-4 shadow-xs hover:-translate-y-0.5"
                href="/dashboard"
              >
                <span>Continue to Workspace</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <>
              {message && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-600 animate-in fade-in duration-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{message}</span>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                  New Password
                </label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#60605D] uppercase tracking-wider block">
                  Confirm Password
                </label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-[9px] bg-white border border-[#D8D8D2] text-sm text-[#121212] placeholder-[#8C8C87] focus:outline-none focus:border-[#8D8D87] focus:ring-2 focus:ring-[#111111]/5 transition-colors"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="Repeat new password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 px-4 rounded-[9px] bg-[#111111] hover:bg-[#202020] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  className="text-xs text-[#60605D] hover:text-[#121212] transition-colors underline"
                  href="/forgot-password"
                >
                  Request another recovery link
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
