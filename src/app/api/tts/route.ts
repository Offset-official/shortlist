import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=" + process.env.GOOGLE_TTS_API_KEY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
    const data = await response.json();

    if (!response.ok) {
      console.error("Google TTS error:", data);
      return NextResponse.json({ error: "Failed to fetch TTS", details: data }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("TTS proxy crashed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
