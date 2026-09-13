import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { ADMIN_COOKIE_NAME, isValidAdminCookieValue } from "@/lib/admin-cookie";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getIsSubscribed(): Promise<boolean> {
  const cookieStore = await cookies();

  const adminCookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (adminCookieValue && isValidAdminCookieValue(adminCookieValue)) {
    return true;
  }

  const user = await getCurrentUser();
  if (!user) return false;

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) return false;

  try {
    const subscription = await stripe.subscriptions.retrieve(row.stripe_subscription_id);
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    return (
      customerId === row.stripe_customer_id &&
      (subscription.status === "active" || subscription.status === "trialing")
    );
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
}

export async function getStripeCustomerId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return row?.stripe_customer_id ?? null;
}
