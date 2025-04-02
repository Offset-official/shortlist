import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "No resume text provided" },
        { status: 400 }
      );
    }

    // System instruction for structured JSON extraction
    const systemInstruction = `
      You are an expert resume parser. Extract structured information from the provided resume text and return it as a JSON object with the following fields:
      
      - personalInfo: Object containing name, email, phone, location, website/portfolio, linkedIn
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
    try {
      // First, attempt to extract just the JSON portion if there's any text around it
      const jsonMatch = response.text.match(/```json\s*([\s\S]*)\s*```/) || 
                        response.text.match(/\{[\s\S]*\}/);
      
      const jsonText = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : response.text;
      const parsedJson = JSON.parse(jsonText);
      
      return NextResponse.json(parsedJson);
    } catch (parseError) {
      // If parsing fails, return the raw text with an error flag
      console.error("Failed to parse JSON response:", parseError);
      return NextResponse.json({ 
        error: "Failed to parse resume into structured format",
        rawText: response.text 
      }, { status: 422 });
    }
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: `Failed to parse resume: ${String(error)}` },
      { status: 500 }
    );
  }
}