// app/api/parsedoc/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractTextFromResume } from "@/lib/resume-parser";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Use the existing extractTextFromResume function
    const extractedText = await extractTextFromResume(file);
    
    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process file" },
      { status: 500 }
    );
  }
}