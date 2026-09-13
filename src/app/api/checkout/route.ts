import { NextResponse } from "next/server";
import { stripe, UNLIMITED_PLAN_PRICE_ID } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!UNLIMITED_PLAN_PRICE_ID) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: UNLIMITED_PLAN_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create a checkout session." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 },
    );
  }
}
