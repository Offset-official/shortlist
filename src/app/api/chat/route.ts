// Groq chat API route — works with Next.js App Router
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // optional: use Edge Runtime for faster responses

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages = body.messages;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-r1-distill-llama-70b", // or "mixtral-8x7b-32768", "gemma-7b-it"
      messages: messages,
    }),
  });

  const data = await response.json();

  const reply = data?.choices?.[0]?.message?.content || "Sorry, no response.";
  return NextResponse.json({ reply });
}
