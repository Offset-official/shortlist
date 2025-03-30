import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [],
  responseMimeType: "text/plain",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "Error: No messages provided." }, { status: 400 });
    }

    // Use the content of the last message as the prompt
    const promptText = messages[messages.length - 1].content;

    // Start a new chat session (with an empty history)
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the prompt and wait for a response
    const result = await chatSession.sendMessage(promptText);

    // Extract the generated text reply.
    // (Assumes the response structure provides a text() method.)
    const replyText = result.response.text();

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    return NextResponse.json({ reply: `Error: ${String(error)}` }, { status: 500 });
  }
}
