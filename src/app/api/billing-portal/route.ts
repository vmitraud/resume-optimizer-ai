import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const customerId = await getStripeCustomerId();

  if (!customerId) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 401 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json(
      { error: "Could not open billing management. Please try again." },
      { status: 500 },
    );
  }
}
