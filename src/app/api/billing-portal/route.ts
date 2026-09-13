import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_COOKIE_NAME, parseSubscriptionCookieValue } from "@/lib/subscription-cookie";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SUBSCRIPTION_COOKIE_NAME)?.value;
  const payload = cookieValue ? parseSubscriptionCookieValue(cookieValue) : null;

  if (!payload) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 401 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: payload.customerId,
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
