import { NextResponse } from "next/server";
import { docxRequestSchema, THEME_COLORS } from "@/lib/schema";
import { createResumeDocx } from "@/lib/resume-docx";
import { getIsSubscribed } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const isSubscribed = await getIsSubscribed();
  if (!isSubscribed) {
    return NextResponse.json(
      { error: "DOCX export requires the Unlimited Plan." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = docxRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 },
    );
  }

  const { resume, themeColor } = parsed.data;
  const accent = THEME_COLORS[themeColor].replace("#", "");

  try {
    const buffer = await createResumeDocx(resume, accent);

    const fileName = (resume.personalInfo.fullName || "resume")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName || "resume"}-optimized.docx"`,
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Error generating the DOCX file." },
      { status: 500 },
    );
  }
}
