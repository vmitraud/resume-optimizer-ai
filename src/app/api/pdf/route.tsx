import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { pdfRequestSchema, RESUME_TEMPLATES } from "@/lib/schema";
import { ResumeDocument } from "@/components/pdf/resume-document";
import { getIsSubscribed } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = pdfRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 },
    );
  }

  const { resume, themeColor, templateId } = parsed.data;

  if (RESUME_TEMPLATES[templateId].isPremium) {
    const isSubscribed = await getIsSubscribed();
    if (!isSubscribed) {
      return NextResponse.json(
        { error: `The ${RESUME_TEMPLATES[templateId].name} template requires the Unlimited Plan.` },
        { status: 403 },
      );
    }
  }

  const document = (
    <ResumeDocument resume={resume} themeColor={themeColor} templateId={templateId} />
  );

  try {
    const buffer = await renderToBuffer(document);

    const fileName = (resume.personalInfo.fullName || "resume")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName || "resume"}-optimized.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating the PDF." },
      { status: 500 },
    );
  }
}
