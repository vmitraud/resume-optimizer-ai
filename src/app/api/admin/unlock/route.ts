import { NextResponse } from "next/server";
import crypto from "crypto";
import { ADMIN_COOKIE_NAME, createAdminCookieValue } from "@/lib/admin-cookie";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey) {
    return NextResponse.json(
      { error: "Admin access is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const key = typeof body === "object" && body !== null ? (body as Record<string, unknown>).key : null;
  if (typeof key !== "string") {
    return NextResponse.json({ error: "Missing key." }, { status: 400 });
  }

  const providedBuffer = Buffer.from(key);
  const expectedBuffer = Buffer.from(adminKey);
  const isValid =
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!isValid) {
    return NextResponse.json({ error: "Incorrect key." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
