import { NextResponse } from "next/server";
import { stripe, UNLIMITED_PLAN_PRICE_ID } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!UNLIMITED_PLAN_PRICE_ID) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 500 },
    );
  }

  const user = await getCurrentUser();
  if (!user || !user.email) {
    return NextResponse.json(
      { error: "Please log in before subscribing." },
      { status: 401 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: UNLIMITED_PLAN_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      // Not yet in the installed Stripe SDK's TypeScript types, but supported by the API:
      // disables Stripe's newer "Managed Payments" feature, which otherwise requires every
      // product to have a tax_code set.
      managed_payments: { enabled: false },
    } as Parameters<typeof stripe.checkout.sessions.create>[0]);

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
