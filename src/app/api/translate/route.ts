import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@google/genai";
import { gemini, OPTIMIZE_MODEL } from "@/lib/gemini";
import { translateRequestSchema, optimizedResumeSchema } from "@/lib/schema";
import { LANGUAGES } from "@/lib/language";
import { translations } from "@/lib/translations";
import { getIsSubscribed } from "@/lib/subscription";

export const runtime = "nodejs";

const buildSystemPrompt = (languageName: string) => `You translate resume JSON objects into ${languageName}.

Rules:
- Translate all human-readable text fields (summary, skills, experience roles/companies/bulletPoints, education
  degrees/institutions, matchAnalysis) into ${languageName}.
- Do NOT translate proper nouns that shouldn't change meaning: person names, company names, email addresses,
  phone numbers, LinkedIn URLs, and location names should stay as-is unless they have a well-known translated
  form (e.g. country names may be translated).
- Keep "period" and "year" fields exactly as they were (dates should not be translated).
- Keep "atsScoreEstimate" exactly the same number as the input.
- Preserve the overall meaning and tone; this is a translation, not a rewrite.
- Return the complete resume object with every field populated, in the same structure as the input.`;

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

  const parsedRequest = translateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 },
    );
  }

  const { resume, language } = parsedRequest.data;

  if (language !== "en") {
    const isSubscribed = await getIsSubscribed();
    if (!isSubscribed) {
      return NextResponse.json(
        { error: translations[language].page.languageProRequired },
        { status: 403 },
      );
    }
  }

  try {
    const response = await gemini.models.generateContent({
      model: OPTIMIZE_MODEL,
      contents: `RESUME JSON:\n"""\n${JSON.stringify(resume)}\n"""`,
      config: {
        systemInstruction: buildSystemPrompt(LANGUAGES[language].aiName),
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(optimizedResumeSchema),
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return NextResponse.json(
        { error: "Could not parse the AI response. Please try again." },
        { status: 502 },
      );
    }

    const parsedOutput = optimizedResumeSchema.safeParse(JSON.parse(rawText));
    if (!parsedOutput.success) {
      return NextResponse.json(
        { error: "Could not parse the AI response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ resume: parsedOutput.data });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { error: "Invalid or missing Gemini API key." },
          { status: 500 },
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please try again shortly." },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: `Gemini API error: ${error.message}` },
        { status: error.status ?? 500 },
      );
    }
    console.error("Unexpected error translating resume:", error);
    return NextResponse.json(
      { error: "Unexpected error translating the resume." },
      { status: 500 },
    );
  }
}
