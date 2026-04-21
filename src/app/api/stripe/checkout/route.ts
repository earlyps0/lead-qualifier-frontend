export const dynamic = "force-dynamic";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Look up or create a Stripe customer
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabaseAdmin.from("profiles").upsert({
      id: user.id,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
  });

  return Response.json({ url: session.url });
}
