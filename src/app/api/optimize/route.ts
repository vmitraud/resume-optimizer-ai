import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@google/genai";
import { gemini, OPTIMIZE_MODEL } from "@/lib/gemini";
import { optimizeRequestSchema, optimizedResumeSchema } from "@/lib/schema";
import { LANGUAGES } from "@/lib/language";

export const runtime = "nodejs";

const buildSystemPrompt = (languageName: string) => `You are an expert recruiter and ATS (Applicant Tracking System) specialist.
Your task is to rewrite the user's resume to maximize compatibility with the described job, without inventing
experiences, titles, companies, or education that are not present in the original resume.

Rules:
- Extract and preserve the candidate's real data (name, contact info, companies, titles, education). If a piece of
  data does not exist in the original resume, leave the field as an empty string ("") instead of inventing it.
- Rewrite the professional summary and experience bullet points to incorporate relevant keywords from the job
  description, but only when they are consistent with the candidate's real experience.
- Prioritize strong action verbs and quantifiable metrics already present or reasonably inferable from the original text.
- Respond in ${languageName}, regardless of the language of the original resume.
- "atsScoreEstimate" is your estimate (0-100) of how well the optimized resume matches the job.
- "matchAnalysis" should contain 3 to 6 short sentences explaining the main improvements made to fit the job, written in ${languageName}.
- Never invent certifications, technologies, or years of experience that are not supported by the original resume.`;

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

  const parsedRequest = optimizeRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid data." },
      { status: 400 },
    );
  }

  const { resumeText, jobDescription, language } = parsedRequest.data;

  try {
    const response = await gemini.models.generateContent({
      model: OPTIMIZE_MODEL,
      contents: `CURRENT RESUME:\n"""\n${resumeText}\n"""\n\nJOB DESCRIPTION:\n"""\n${jobDescription}\n"""`,
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
    console.error("Unexpected error optimizing resume:", error);
    return NextResponse.json(
      { error: "Unexpected error optimizing the resume." },
      { status: 500 },
    );
  }
}
