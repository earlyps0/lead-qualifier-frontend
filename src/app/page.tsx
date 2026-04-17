"use client";

import { useRef, useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { ResultCard } from "@/components/ResultCard";
import type { LeadInput, QualificationResult, RunStatus } from "@/lib/types";

const TERMINAL_STATUSES: RunStatus[] = [
  "COMPLETED",
  "FAILED",
  "CRASHED",
  "CANCELED",
  "INTERRUPTED",
  "SYSTEM_FAILURE",
  "TIMED_OUT",
  "EXPIRED",
];

type AppState =
  | { phase: "idle" }
  | { phase: "analyzing" }
  | { phase: "done"; result: QualificationResult }
  | { phase: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ phase: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function handleSubmit(data: LeadInput) {
    setState({ phase: "analyzing" });
    stopPolling();

    try {
      const triggerRes = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!triggerRes.ok) {
        const err = await triggerRes.json();
        throw new Error(err.error ?? "Failed to start analysis");
      }

      const { runId } = await triggerRes.json();

      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/qualify?runId=${runId}`);
          if (!pollRes.ok) return;

          const { status, output } = (await pollRes.json()) as {
            status: RunStatus;
            output?: QualificationResult;
          };

          if (TERMINAL_STATUSES.includes(status)) {
            stopPolling();
            if (status === "COMPLETED" && output) {
              setState({ phase: "done", result: output });
            } else {
              setState({
                phase: "error",
                message: `Analysis ${status.toLowerCase()}. Please try again.`,
              });
            }
          }
        } catch {
          // transient network error — keep polling
        }
      }, 2000);
    } catch (err) {
      stopPolling();
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Unexpected error",
      });
    }
  }

  const isLoading = state.phase === "analyzing";

  return (
    <main className="min-h-screen px-4 py-12 sm:px-8">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-[#475569]">
            AI-Powered
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#E2E8F0] mb-3">
          Lead Qualifier
        </h1>
        <p className="text-sm text-[#475569] max-w-md">
          Evaluate prospects using the{" "}
          <span className="text-[#64748B] font-mono">BANT</span> framework —
          Budget, Authority, Need, Timeline — scored by Claude AI.
        </p>
      </header>

      {/* Two-column layout */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Form card */}
        <div className="rounded-2xl border border-[#1C2A3D] bg-[#0C1220] p-8">
          <div className="mb-6 space-y-1">
            <p className="text-xs font-mono tracking-widest uppercase text-[#475569]">
              Step 01
            </p>
            <h2 className="text-xl font-serif text-[#CBD5E1]">
              Lead Intelligence
            </h2>
          </div>
          <LeadForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Results panel */}
        <div className="sticky top-8">
          {state.phase === "idle" && (
            <div className="rounded-2xl border border-dashed border-[#1C2A3D] p-8 flex flex-col items-center justify-center gap-4 min-h-72 text-center">
              <div className="w-14 h-14 rounded-full border border-[#1C2A3D] flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[#334155]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#334155] font-mono">
                  Fill out the form
                </p>
                <p className="text-xs text-[#1E2D3D] mt-1">
                  Results will appear here
                </p>
              </div>
            </div>
          )}

          {state.phase === "analyzing" && (
            <div className="rounded-2xl border border-[#1C2A3D] bg-[#0C1220] p-8 flex flex-col items-center justify-center gap-6 min-h-72">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-[#1C2A3D]" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#3B82F6] animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-mono text-sm text-[#64748B] tracking-wider">
                  Analyzing…
                </p>
                <p className="text-xs text-[#334155] mt-2">
                  Claude is scoring this lead via BANT
                </p>
              </div>
              <div className="flex gap-1.5">
                {["Budget", "Authority", "Need", "Timeline"].map((dim) => (
                  <span
                    key={dim}
                    className="text-xs font-mono px-2 py-0.5 rounded border border-[#1C2A3D] text-[#334155]"
                  >
                    {dim[0]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {state.phase === "done" && <ResultCard result={state.result} />}

          {state.phase === "error" && (
            <div className="rounded-2xl border border-[#F87171]/30 bg-[#F87171]/5 p-8 flex flex-col items-center gap-4 min-h-40 text-center">
              <div className="w-10 h-10 rounded-full border border-[#F87171]/30 flex items-center justify-center">
                <span className="text-[#F87171] text-lg">!</span>
              </div>
              <div>
                <p className="text-sm text-[#F87171] font-mono">
                  Analysis Failed
                </p>
                <p className="text-xs text-[#64748B] mt-1">{state.message}</p>
              </div>
              <button
                onClick={() => setState({ phase: "idle" })}
                className="text-xs font-mono text-[#475569] hover:text-[#CBD5E1] transition-colors underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto mt-16 pt-8 border-t border-[#1C2A3D]">
        <p className="text-xs text-[#1E2D3D] font-mono text-center">
          Powered by Claude Sonnet · Trigger.dev · BANT Framework
        </p>
      </footer>
    </main>
  );
}
