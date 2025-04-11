import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from '@/lib/prisma';

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, candidateId } = body;

    if (!text) {
      return NextResponse.json(
        { error: "No resume text provided" },
        { status: 400 }
      );
    }

    if (!candidateId) {
      return NextResponse.json(
        { error: "No candidate ID provided" },
        { status: 400 }
      );
    }

    const systemInstruction = `
      You are an expert resume parser. Extract structured information from the provided resume text and return it as a JSON object with the following fields:
      
      - personalInfo: Object containing name, email, phone, location, website/portfolio
      - education: Array of objects, each containing:
          - degree: String
          - institution: String
          - location: String
          - dates: String
          - gpa: String (if available)
          - achievements: Array of strings
      - experience: Array of objects, each containing:
          - title: String
          - company: String
          - location: String
          - dates: String
          - responsibilities: Array of strings
          - achievements: Array of strings
      - skills: Object containing:
          - technical: Array of strings
          - soft: Array of strings
      - projects: Array of objects (if present), each containing:
          - name: String
          - description: String
          - technologies: Array of strings
      - achievements: Array of strings (if present)
      - summary: String (if present)
      
      Return ONLY valid JSON without any explanations or additional text. If a section doesn't exist in the resume, include an empty array or object for that field.
    `;

    const chat = ai.chats.create({
      model: "gemini-2.0-flash-lite",
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({ message: text });
    
    // Try to parse the response as JSON
    let parsedJson;
    try {
      // First, attempt to extract just the JSON portion if there's any text around it
      const jsonMatch = (response.text ?? "").match(/```json\s*([\s\S]*)\s*```/) || 
                        (response.text ?? "").match(/\{[\s\S]*\}/);
      
      const jsonText = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : response.text;
      if (!jsonText) {
        throw new Error("JSON text is undefined or empty");
      }
      parsedJson = JSON.parse(jsonText);
    } catch (parseError) {
      // If parsing fails, return the raw text with an error flag
      console.error("Failed to parse JSON response:", parseError);
      return NextResponse.json({ 
        error: "Failed to parse resume into structured format",
        rawText: response.text 
      }, { status: 422 });
    }

    // If JSON parsed successfully, update the candidate in the database
    try {
      const technicalSkills = parsedJson.skills?.technical || [];
      const softSkills = parsedJson.skills?.soft || [];
      
      const allSkills = [...technicalSkills, ...softSkills];
      
      // Get candidate info for updating
      const candidateInfo = {
        location: parsedJson.personalInfo?.location || "",
        collegeName: parsedJson.education?.[0]?.institution || "",
        // Extract graduation year if available
        year: parsedJson.education?.[0]?.dates ? 
          parseInt(parsedJson.education[0].dates.match(/\d{4}/)?.[0] || "0") : 
          null
      };

      // Update candidate in database
      const updatedCandidate = await prisma.candidate.update({
        where: {
          id: parseInt(candidateId)
        },
        data: {
          resume: parsedJson,
          skills: allSkills.length > 0 ? allSkills : undefined,
          location: candidateInfo.location || undefined,
          collegeName: candidateInfo.collegeName || undefined,
          year: candidateInfo.year || undefined,
        }
      });

      return NextResponse.json({
        success: true,
        message: "Resume data saved successfully",
        data: parsedJson,
        candidateId: updatedCandidate.id
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      
      // Handle unique constraint violation separately
      if (dbError.code === 'P2002') {
        return NextResponse.json({
          error: "Email address already exists in the system",
          data: parsedJson
        }, { status: 409 });
      }
      
      return NextResponse.json({
        error: `Failed to update candidate: ${dbError.message}`,
        data: parsedJson
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: `Failed to parse resume: ${String(error)}` },
      { status: 500 }
    );
  }
}