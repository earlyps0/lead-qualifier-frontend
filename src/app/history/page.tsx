import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

function scoreColor(score: number) {
  if (score >= 70) return "text-[#4ADE80]";
  if (score >= 40) return "text-[#FACC15]";
  return "text-[#F87171]";
}

function scoreBorder(score: number) {
  if (score >= 70) return "border-[#4ADE80]/30 bg-[#4ADE80]/5";
  if (score >= 40) return "border-[#FACC15]/30 bg-[#FACC15]/5";
  return "border-[#F87171]/30 bg-[#F87171]/5";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (leads ?? []) as Lead[];

  return (
    <main className="min-h-screen px-4 py-12 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#475569] hover:text-[#CBD5E1] transition-colors mb-6"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to qualifier
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#475569]">
              Lead History
            </span>
          </div>
          <h1 className="font-serif text-4xl text-[#E2E8F0]">Past Qualifications</h1>
          <p className="text-sm text-[#475569] mt-2">{rows.length} lead{rows.length !== 1 ? "s" : ""} scored</p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1C2A3D] p-12 text-center">
            <p className="text-sm font-mono text-[#334155]">No leads qualified yet</p>
            <p className="text-xs text-[#1E2D3D] mt-1">Submit your first lead to see results here</p>
            <Link
              href="/"
              className="inline-block mt-6 text-xs font-mono text-[#3B82F6] hover:text-[#60A5FA] transition-colors underline underline-offset-2"
            >
              Qualify a lead →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl border border-[#1C2A3D] bg-[#0C1220] p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-base font-serif text-[#CBD5E1]">{lead.company_name}</h2>
                    <p className="text-xs font-mono text-[#475569] mt-0.5">
                      {lead.industry} · {lead.budget}
                    </p>
                  </div>
                  <div className={`shrink-0 rounded-xl border px-3 py-1.5 text-center ${scoreBorder(lead.score)}`}>
                    <span className={`text-xl font-mono font-bold ${scoreColor(lead.score)}`}>
                      {lead.score}
                    </span>
                    <p className="text-[10px] font-mono text-[#475569] mt-0.5">/ 100</p>
                  </div>
                </div>

                <p className="text-xs text-[#64748B] mb-4 leading-relaxed">{lead.summary}</p>

                {/* BANT breakdown */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {(
                    [
                      { label: "Budget", value: lead.bant_budget },
                      { label: "Authority", value: lead.bant_authority },
                      { label: "Need", value: lead.bant_need },
                      { label: "Timeline", value: lead.bant_timeline },
                    ] as const
                  ).map(({ label, value }) => (
                    <div key={label} className="rounded-lg border border-[#1C2A3D] bg-[#060D18] p-2 text-center">
                      <p className="text-xs font-mono text-[#475569]">{label[0]}</p>
                      <p className={`text-sm font-mono font-semibold mt-0.5 ${scoreColor(value * 4)}`}>
                        {value}
                        <span className="text-[#334155] font-normal">/25</span>
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] font-mono text-[#334155] text-right">
                  {formatDate(lead.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
