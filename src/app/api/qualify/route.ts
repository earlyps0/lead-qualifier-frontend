import { tasks, runs } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";
import type { QualificationResult, RunStatus } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = await (tasks.trigger as any)("qualify-lead", {
      ...body,
      userId: user.id,
    });

    return Response.json({ runId: handle.id });
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
