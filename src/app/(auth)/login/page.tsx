"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-[#1C2A3D] bg-[#060D18] px-4 py-2.5 text-sm text-[#CBD5E1] placeholder-[#334155] focus:outline-none focus:border-[#3B82F6] transition-colors font-mono";

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
          <span className="font-mono text-xs tracking-widest uppercase text-[#475569]">
            AI-Powered
          </span>
        </div>
        <h1 className="font-serif text-3xl text-[#E2E8F0] mb-1">Sign in</h1>
        <p className="text-sm text-[#475569]">Access your lead qualifier</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#475569] mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#475569] mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-[#F87171]/30 bg-[#F87171]/5 px-4 py-3">
            <p className="text-xs font-mono text-[#F87171]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-mono text-white hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#475569] font-mono">
        No account?{" "}
        <Link href="/signup" className="text-[#64748B] hover:text-[#CBD5E1] transition-colors underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </>
  );
}
