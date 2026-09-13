import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_COOKIE_NAME, createSubscriptionCookieValue } from "@/lib/subscription-cookie";

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

    if (
      session.payment_status !== "paid" ||
      !subscription ||
      typeof subscription === "string" ||
      !customerId
    ) {
      return NextResponse.redirect(`${origin}/?checkout=error`);
    }

    const cookieValue = createSubscriptionCookieValue({
      customerId,
      subscriptionId: subscription.id,
    });

    const response = NextResponse.redirect(`${origin}/?checkout=success`);
    response.cookies.set(SUBSCRIPTION_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error confirming checkout session:", error);
    return NextResponse.redirect(`${origin}/?checkout=error`);
  }
}
