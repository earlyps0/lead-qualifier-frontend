import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) break;

        await supabaseAdmin.from("profiles").upsert({
          id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer as string)
          .single();

        if (data) {
          const periodEnd = sub.items.data[0]?.current_period_end;
          await supabaseAdmin.from("profiles").update({
            subscription_status: sub.status,
            stripe_subscription_id: sub.id,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          }).eq("id", data.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer as string)
          .single();

        if (data) {
          await supabaseAdmin.from("profiles").update({
            subscription_status: "canceled",
            current_period_end: null,
            updated_at: new Date().toISOString(),
          }).eq("id", data.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", invoice.customer as string)
          .single();

        if (data) {
          await supabaseAdmin.from("profiles").update({
            subscription_status: "past_due",
            updated_at: new Date().toISOString(),
          }).eq("id", data.id);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.parent?.type !== "subscription_details") break;

        const { data } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", invoice.customer as string)
          .single();

        if (data) {
          await supabaseAdmin.from("profiles").update({
            subscription_status: "active",
            updated_at: new Date().toISOString(),
          }).eq("id", data.id);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
