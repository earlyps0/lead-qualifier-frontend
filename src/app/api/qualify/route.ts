import { tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { QualificationResult, RunStatus } from "@/lib/types";

const FREE_DAILY_LIMIT = 2;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check subscription and enforce daily limit for free users
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const status = profile?.subscription_status ?? "free";
  const isPaid = status === "active" || status === "trialing";

  let remaining: number | null = null;

  if (!isPaid) {
    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);

    const { count } = await supabaseAdmin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayUtc.toISOString());

    const used = count ?? 0;

    if (used >= FREE_DAILY_LIMIT) {
      return Response.json(
        {
          error: "daily_limit_reached",
          message: `You have used your ${FREE_DAILY_LIMIT} free qualifications for today. Upgrade to Pro for unlimited access.`,
          used,
          limit: FREE_DAILY_LIMIT,
        },
        { status: 429 }
      );
    }

    remaining = FREE_DAILY_LIMIT - used - 1;
  }

  try {
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = await (tasks.trigger as any)("qualify-lead", {
      ...body,
      userId: user.id,
    });

    return Response.json({ runId: handle.id, remaining });
  } catch (err) {
    console.error("Failed to trigger qualify-lead task:", err);
    return Response.json({ error: "Failed to start analysis" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");

  if (!runId) {
    return Response.json({ error: "runId is required" }, { status: 400 });
  }

  try {
    const run = await runs.retrieve(runId);

    return Response.json({
      status: run.status as RunStatus,
      output: run.output as QualificationResult | undefined,
    });
  } catch (err) {
    console.error("Failed to retrieve run:", err);
    return Response.json({ error: "Failed to fetch analysis status" }, { status: 500 });
  }
}

// GET /api/qualify/usage — returns today's usage for the current user
export async function HEAD(request: Request) {
  void request;
  return new Response(null, { status: 405 });
}
