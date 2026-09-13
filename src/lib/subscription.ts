import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { SUBSCRIPTION_COOKIE_NAME, parseSubscriptionCookieValue } from "@/lib/subscription-cookie";
import { ADMIN_COOKIE_NAME, isValidAdminCookieValue } from "@/lib/admin-cookie";

export async function getIsSubscribed(): Promise<boolean> {
  const cookieStore = await cookies();

  const adminCookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (adminCookieValue && isValidAdminCookieValue(adminCookieValue)) {
    return true;
  }

  const cookieValue = cookieStore.get(SUBSCRIPTION_COOKIE_NAME)?.value;
  if (!cookieValue) return false;

  const payload = parseSubscriptionCookieValue(cookieValue);
  if (!payload) return false;

  try {
    const subscription = await stripe.subscriptions.retrieve(payload.subscriptionId);
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    return (
      customerId === payload.customerId &&
      (subscription.status === "active" || subscription.status === "trialing")
    );
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}
