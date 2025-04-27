import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* ------------------------------------------------------------------ */
/* ENV CHECK                                                          */
/* ------------------------------------------------------------------ */
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("GROQ_API_KEY is not set");

/* ------------------------------------------------------------------ */
/* POST /api/llm                                                      */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    /* ---------------- parse body ---------------------------------- */
    const body = await req.json();
    let { messages, systemInstruction } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "Error: No messages provided." },
        { status: 400 },
      );
    }

    /* ---------------- normalise + strip system msgs --------------- */
    messages = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => {
        let text: string;

        if (typeof m.content === "string") {
          text = m.content;
        } else if (Array.isArray(m.content?.parts)) {
          text = m.content.parts.map((p: any) => p.text).join(" ");
        } else {
          text = String(m.content);
        }

        return { role: m.role, content: text };
      });

    /* ---------------- insert our own system message --------------- */
    messages.unshift({
      role: "system",
      content: systemInstruction ?? "You are a helpful assistant.",
    });

    /* ---------------- call Groq ----------------------------------- */
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          max_tokens: 500,
        }),
      },
    );

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq API error ${groqRes.status}: ${err}`);
    }

    const data = await groqRes.json();
    const replyText: string = data.choices?.[0]?.message?.content ?? "";

    /* ---------------- post-process -------------------------------- */
    const isInterviewOver = replyText.includes("<INTERVIEW OVER>");
    const cleanedReply = replyText.replace(/<INTERVIEW OVER>/g, "").trim();

    return NextResponse.json({ reply: cleanedReply, isInterviewOver });
  } catch (error) {
    console.error("[LLM-API] error:", error);
    return NextResponse.json(
      { reply: `Error: ${String(error)}` },
      { status: 500 },
    );
  }
}
