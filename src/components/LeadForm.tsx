"use client";

import { useState } from "react";
import type { LeadInput } from "@/lib/types";

interface LeadFormProps {
  onSubmit: (data: LeadInput) => void;
  isLoading: boolean;
}

const INDUSTRIES = [
  "SaaS / Software",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "Manufacturing",
  "Consulting / Services",
  "Real Estate",
  "Education",
  "Media / Marketing",
  "Other",
];

const BUDGET_OPTIONS = [
  "< $10k",
  "$10k – $50k",
  "$50k – $150k",
  "$150k – $500k",
  "> $500k",
  "Unknown / TBD",
];

const TIMELINE_OPTIONS = [
  "ASAP / Immediately",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "> 12 months",
  "Unknown",
];

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono tracking-widest uppercase text-[#475569]">
        {label}
        {required && <span className="text-[#F87171] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[#334155]">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-[#0C1220] border border-[#1C2A3D] rounded-lg px-4 py-2.5 text-sm text-[#CBD5E1] placeholder-[#334155] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors";

const selectClass =
  "w-full bg-[#0C1220] border border-[#1C2A3D] rounded-lg px-4 py-2.5 text-sm text-[#CBD5E1] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors appearance-none cursor-pointer";

export function LeadForm({ onSubmit, isLoading }: LeadFormProps) {
  const [form, setForm] = useState<LeadInput>({
    companyName: "",
    industry: "",
    budget: "",
    authorityRole: "",
    painPoint: "",
    timeline: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadInput, string>>>({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof LeadInput, string>> = {};
    if (!form.companyName.trim()) newErrors.companyName = "Required";
    if (!form.industry.trim()) newErrors.industry = "Required";
    if (!form.budget.trim()) newErrors.budget = "Required";
    if (!form.authorityRole.trim()) newErrors.authorityRole = "Required";
    if (!form.painPoint.trim()) newErrors.painPoint = "Required";
    if (!form.timeline.trim()) newErrors.timeline = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LeadInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Company Name" required>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Acme Corp"
            className={`${inputClass} ${errors.companyName ? "border-[#F87171]" : ""}`}
          />
          {errors.companyName && (
            <p className="text-xs text-[#F87171] mt-1">{errors.companyName}</p>
          )}
        </Field>

        <Field label="Industry" required>
          <div className="relative">
            <select
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className={`${selectClass} ${errors.industry ? "border-[#F87171]" : ""}`}
            >
              <option value="">Select industry…</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
              ▾
            </span>
          </div>
          {errors.industry && (
            <p className="text-xs text-[#F87171] mt-1">{errors.industry}</p>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Budget Range" required hint="Approximate annual/project budget">
          <div className="relative">
            <select
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className={`${selectClass} ${errors.budget ? "border-[#F87171]" : ""}`}
            >
              <option value="">Select budget…</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
              ▾
            </span>
          </div>
          {errors.budget && (
            <p className="text-xs text-[#F87171] mt-1">{errors.budget}</p>
          )}
        </Field>

        <Field label="Contact Role" required hint="Who you're speaking with">
          <input
            name="authorityRole"
            value={form.authorityRole}
            onChange={handleChange}
            placeholder="CTO, VP Sales, Founder…"
            className={`${inputClass} ${errors.authorityRole ? "border-[#F87171]" : ""}`}
          />
          {errors.authorityRole && (
            <p className="text-xs text-[#F87171] mt-1">{errors.authorityRole}</p>
          )}
        </Field>
      </div>

      <Field label="Pain Point / Need" required hint="What problem are they trying to solve?">
        <textarea
          name="painPoint"
          value={form.painPoint}
          onChange={handleChange}
          rows={3}
          placeholder="Describe the core challenge or goal this lead is facing…"
          className={`${inputClass} resize-none ${errors.painPoint ? "border-[#F87171]" : ""}`}
        />
        {errors.painPoint && (
          <p className="text-xs text-[#F87171] mt-1">{errors.painPoint}</p>
        )}
      </Field>

      <Field label="Purchase Timeline" required>
        <div className="relative">
          <select
            name="timeline"
            value={form.timeline}
            onChange={handleChange}
            className={`${selectClass} ${errors.timeline ? "border-[#F87171]" : ""}`}
          >
            <option value="">Select timeline…</option>
            {TIMELINE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
            ▾
          </span>
        </div>
        {errors.timeline && (
          <p className="text-xs text-[#F87171] mt-1">{errors.timeline}</p>
        )}
      </Field>

      <Field label="Additional Notes" hint="Optional — context, call notes, prior interactions">
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Any extra context that might help the analysis…"
          className={`${inputClass} resize-none`}
        />
      </Field>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-xl font-mono text-sm tracking-wider uppercase font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        style={{
          background: isLoading
            ? "#1C2A3D"
            : "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)",
          color: isLoading ? "#475569" : "#fff",
          boxShadow: isLoading ? "none" : "0 0 20px #3B82F620",
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Analyzing Lead…
          </span>
        ) : (
          "Analyze Lead"
        )}
      </button>
    </form>
  );
}
