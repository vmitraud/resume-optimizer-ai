import { NextResponse } from "next/server";
import { getIsSubscribed } from "@/lib/subscription";

export const runtime = "nodejs";

export async function GET() {
  const isSubscribed = await getIsSubscribed();
  return NextResponse.json({ isSubscribed });
}
