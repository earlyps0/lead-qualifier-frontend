"use client";

interface BANTBarProps {
  label: string;
  value: number;
  max?: number;
  delay?: number;
}

export function BANTBar({ label, value, max = 25, delay = 0 }: BANTBarProps) {
  const pct = Math.round((value / max) * 100);

  const barColor =
    pct >= 70 ? "#4ADE80" : pct >= 40 ? "#FBBF24" : "#F87171";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest uppercase text-[#64748B]">
          {label}
        </span>
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: barColor }}
        >
          {value}
          <span className="text-[#334155] font-normal">/{max}</span>
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-[#1C2A3D] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
            transitionDelay: `${delay}ms`,
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>
    </div>
  );
}
