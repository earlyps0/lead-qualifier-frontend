"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, UsageInfo } from "@/lib/types";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const justUpgraded = searchParams.get("success") === "1";
  const canceledCheckout = searchParams.get("canceled") === "1";

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data } = await supabase
        .from("profiles")
        .select("id, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end")
        .eq("id", user.id)
        .single();

      setProfile((data as UserProfile) ?? { id: user.id, stripe_customer_id: null, stripe_subscription_id: null, subscription_status: "free", current_period_end: null });

      const usageRes = await fetch("/api/qualify/usage");
      if (usageRes.ok) setUsage(await usageRes.json());

      setLoading(false);
    }
    load();
  }, [router]);

  async function handleUpgrade() {
    setActionLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setActionLoading(false);
  }

  async function handlePortal() {
    setActionLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setActionLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-12 sm:px-8 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#3B82F6] border-[#1C2A3D] animate-spin" />
      </main>
    );
  }

  const status = profile?.subscription_status ?? "free";
  const isPaid = status === "active" || status === "trialing";
  const isPastDue = status === "past_due";
  const isCanceled = status === "canceled";

  return (
    <main className="min-h-screen px-4 py-12 sm:px-8">
      <header className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-xs font-mono text-[#475569] hover:text-[#CBD5E1] transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </Link>
        </div>
        <h1 className="font-serif text-3xl text-[#E2E8F0] mb-1">Billing</h1>
        <p className="text-sm text-[#475569]">Manage your plan and subscription.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Status banners */}
        {justUpgraded && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400 font-mono">
            Upgrade successful — unlimited qualifications are now active.
          </div>
        )}
        {canceledCheckout && (
          <div className="rounded-xl border border-[#475569]/30 bg-[#0C1220] px-4 py-3 text-sm text-[#475569] font-mono">
            Checkout canceled. No changes were made.
          </div>
        )}
        {isPastDue && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400 font-mono">
            Payment failed. Update your payment method to restore unlimited access.
          </div>
        )}

        {/* Plan card */}
        <div className="rounded-2xl border border-[#1C2A3D] bg-[#0C1220] p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase text-[#475569] mb-1">Current Plan</p>
              <h2 className="text-xl font-serif text-[#CBD5E1]">
                {isPaid ? "Pro" : "Free"}
              </h2>
            </div>
            <span className={`text-xs font-mono px-2.5 py-1 rounded border ${
              isPaid ? "border-[#3B82F6]/40 text-[#3B82F6] bg-[#3B82F6]/10" :
              isPastDue ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/10" :
              isCanceled ? "border-[#F87171]/40 text-[#F87171] bg-[#F87171]/10" :
              "border-[#1C2A3D] text-[#475569]"
            }`}>
              {isPaid ? "Active" : isPastDue ? "Past Due" : isCanceled ? "Canceled" : "Free"}
            </span>
          </div>

          {/* Free tier usage */}
          {!isPaid && usage && (
            <div className="mb-6 p-4 rounded-xl border border-[#1C2A3D] bg-[#080E1A]">
              <p className="text-xs font-mono text-[#475569] mb-3">Daily usage</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#CBD5E1]">
                  {usage.used} / {usage.limit} qualifications used today
                </span>
                <span className={`text-xs font-mono ${usage.remaining === 0 ? "text-[#F87171]" : "text-[#64748B]"}`}>
                  {usage.remaining} remaining
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1C2A3D] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usage.remaining === 0 ? "bg-[#F87171]" : "bg-[#3B82F6]"}`}
                  style={{ width: `${((usage.used ?? 0) / (usage.limit ?? 2)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#334155] mt-2">Resets at midnight UTC</p>
            </div>
          )}

          {/* Pro tier details */}
          {isPaid && profile?.current_period_end && (
            <div className="mb-6 p-4 rounded-xl border border-[#1C2A3D] bg-[#080E1A]">
              <p className="text-xs font-mono text-[#475569] mb-1">Next renewal</p>
              <p className="text-sm text-[#CBD5E1]">
                {new Date(profile.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}

          {/* Features list */}
          <div className="mb-8 space-y-2">
            {[
              { label: "2 qualifications/day", included: true, pro: false },
              { label: "Unlimited qualifications", included: isPaid, pro: true },
              { label: "Full BANT scoring", included: true, pro: false },
              { label: "Lead history", included: true, pro: false },
            ].map(({ label, included, pro }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`text-xs ${included ? "text-[#3B82F6]" : "text-[#1C2A3D]"}`}>
                  {included ? "✓" : "○"}
                </span>
                <span className={`text-sm ${included ? "text-[#94A3B8]" : "text-[#334155]"}`}>
                  {label}
                  {pro && !isPaid && (
                    <span className="ml-1.5 text-xs font-mono text-[#3B82F6]">Pro</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!isPaid && (
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-mono rounded-xl px-4 py-3 transition-colors"
            >
              {actionLoading ? "Redirecting…" : "Upgrade to Pro — $29/month"}
            </button>
          )}
          {(isPaid || isPastDue) && (
            <button
              onClick={handlePortal}
              disabled={actionLoading}
              className="w-full border border-[#1C2A3D] hover:border-[#2D4263] text-[#94A3B8] hover:text-[#CBD5E1] text-sm font-mono rounded-xl px-4 py-3 transition-colors disabled:opacity-50"
            >
              {actionLoading ? "Redirecting…" : "Manage subscription"}
            </button>
          )}
          {isCanceled && (
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 text-white text-sm font-mono rounded-xl px-4 py-3 transition-colors"
            >
              {actionLoading ? "Redirecting…" : "Reactivate Pro — $29/month"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
