"use client";

import { BANTBar } from "./BANTBar";
import type { QualificationResult } from "@/lib/types";

interface ResultCardProps {
  result: QualificationResult;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "#4ADE80" : score >= 40 ? "#FBBF24" : "#F87171";

  const label =
    score >= 70 ? "Strong Fit" : score >= 40 ? "Potential Fit" : "Weak Fit";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 120 120"
          className="w-36 h-36 -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#1C2A3D"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span
            className="font-serif text-4xl font-normal leading-none"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-[#475569] mt-1 font-mono">/100</span>
        </div>
      </div>

      <span
        className="text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border"
        style={{
          color,
          borderColor: `${color}40`,
          backgroundColor: `${color}10`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function ResultCard({ result }: ResultCardProps) {
  const { score, summary, bant } = result;

  return (
    <div className="rounded-2xl border border-[#1C2A3D] bg-[#0C1220] p-8 space-y-8 animate-fadeIn">
      <div className="space-y-1">
        <p className="text-xs font-mono tracking-widest uppercase text-[#475569]">
          BANT Score
        </p>
        <h2 className="text-xl font-serif text-[#CBD5E1]">
          Lead Analysis
        </h2>
      </div>

      <div className="flex justify-center">
        <ScoreRing score={score} />
      </div>

      <p className="text-sm text-[#94A3B8] leading-relaxed border-l-2 border-[#1C2A3D] pl-4">
        {summary}
      </p>

      <div className="space-y-4 pt-2">
        <p className="text-xs font-mono tracking-widest uppercase text-[#334155]">
          Breakdown
        </p>
        <BANTBar label="Budget" value={bant.budget} delay={0} />
        <BANTBar label="Authority" value={bant.authority} delay={100} />
        <BANTBar label="Need" value={bant.need} delay={200} />
        <BANTBar label="Timeline" value={bant.timeline} delay={300} />
      </div>
    </div>
  );
}
