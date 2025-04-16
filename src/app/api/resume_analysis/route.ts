// app/api/resume_analysis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const { candidateId, resume } = await req.json();
    if (!candidateId || !resume) {
      return NextResponse.json(
        { error: "Missing candidateId or resume text" },
        { status: 400 }
      );
    }

    const systemInstruction = `
You are an expert ATS resume evaluator. You will receive a resume in raw JSON format.

Split into sections by these headings:
  • "personalInfo" (name, email, phone, location, website/portfolio)
  • "skills" (two arrays: "technical" and "soft")
  • "projects"
  • "experience"
  • "education"
  • "achievements"
Ignore any "summary".

For each section, compute:
  • score (integer 0–100)
  • rationale: one sentence explaining that score
  • suggestions: if score < 100, return 2–3 concrete content-only improvements; if score is 100, return an empty array.

When analyzing sections:
  - Do not provide any job-specific feedback.
  - Do not provide any feedback on formatting or link to demos/projects.
  - For skills, only evaluate based on the provided technical and soft lists.

Compute overall metrics:
  • overallScore: average of all six section scores (rounded to one decimal)
  • overallRationale: a short paragraph summarizing the strongest and weakest areas.
  • overallRecommendations: the three most common suggestion themes (one sentence each).

Output ONLY valid JSON with exactly these keys:
{
  "overallScore": <number>,
  "overallRationale": "<string>",
  "overallRecommendations": ["<string>", "<string>", "<string>"],
  "sections": {
    "personalInfo":    { "score": <number>, "rationale": "<string>", "suggestions": ["<string>", …] },
    "skills":          { "score": <number>, "rationale": "<string>", "suggestions": ["<string>", …] },
    "projects":        { "score": <number>, "rationale": "<string>", "suggestions": ["<string>", …] },
    "experience":      { "score": <number>, "rationale": "<string>", "suggestions": ["<string>", …] },
    "education":       { "score": <number>, "rationale": "<string>", "suggestions": ["<string>", …] },
    "achievements":    { "score": <number>, "rationale": "<string>", "suggestions": ["<string>", …] }
  }
}
`.trim();

    const chat = ai.chats.create({
      model: "gemini-2.0-flash-lite",
      config: { systemInstruction }
    });

    // send raw JSON resume directly
    const response = await chat.sendMessage({ message: JSON.stringify(resume) });

    // extract JSON
    const jsonMatch =
      response.text?.match(/```json\s*([\s\S]*?)```/) ||
      response.text?.match(/\{[\s\S]*\}$/);
    const jsonText = jsonMatch
      ? jsonMatch[0].replace(/```json|```/g, "")
      : response.text;
    if (!jsonText) throw new Error("No JSON found in ATS response");

    const analysis = JSON.parse(jsonText);

    let overallScore = 0;
    let sectionCount = 0;

    for (const section in analysis.sections) {
      const score = analysis.sections[section].score;
      if (typeof score === "number") {
        overallScore += score;
        // console.log(score, section);
        sectionCount++;
      }
    }
    if (sectionCount > 0) {
      overallScore = Math.round(overallScore / sectionCount);
    }
    analysis.overallScore = overallScore;
    // console.log("Overall Score:", overallScore);

    // persist
    await prisma.candidate.update({
      where: { id: parseInt(candidateId, 10) },
      data: { resumeAnalysis: analysis },
    });

    return NextResponse.json({ success: true, data: analysis });
  } catch (err: any) {
    console.error("ATS analysis error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error during ATS analysis" },
      { status: 500 }
    );
  }
}
