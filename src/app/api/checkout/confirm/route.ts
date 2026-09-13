import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const origin = url.origin;

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/?checkout=error`);
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    const subscription = session.subscription;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;
    const userId = session.client_reference_id;

    if (
      session.payment_status !== "paid" ||
      !subscription ||
      typeof subscription === "string" ||
      !customerId ||
      !userId
    ) {
      return NextResponse.redirect(`${origin}/?checkout=error`);
    }

    const admin = createAdminClient();
    const { error } = await admin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving subscription:", error);
      return NextResponse.redirect(`${origin}/?checkout=error`);
    }

    return NextResponse.redirect(`${origin}/?checkout=success`);
  } catch (error) {
    console.error("Error confirming checkout session:", error);
    return NextResponse.redirect(`${origin}/?checkout=error`);
  }
}
