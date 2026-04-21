import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const FREE_DAILY_LIMIT = 2;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const status = profile?.subscription_status ?? "free";
  const isPaid = status === "active" || status === "trialing";

  if (isPaid) {
    return Response.json({ used: null, limit: null, remaining: null });
  }

  const todayUtc = new Date();
  todayUtc.setUTCHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", todayUtc.toISOString());

  const used = count ?? 0;

  return Response.json({
    used,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
  });
}
