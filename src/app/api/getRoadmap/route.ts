import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("GROQ_API_KEY is not set");

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    const prompt = `Create a visually clean, simplified Mermaid.js roadmap diagram for ${topic} interview preparation.\n\nRequirements:\n- Focus on only the 5-6 most essential concept areas that interviewers commonly ask about, with 2-3 key subtopics under each.\n- Show a clear, linear progression from a \"Start\" node to an \"Interview Ready\" end node.\n- Use this specific color scheme:\n  - Main nodes: fill:#E55D3F, stroke:#0B0C0E, color:#FFFFFF\n  - Subtopic nodes: fill:#FFFFFF, stroke:#E2E2E2\n  - Start/End nodes: fill:#25C66E, stroke:#0B0C0E, color:#FFFFFF\n  - Connection lines: stroke:#3F96DA, stroke-width:2px\n  - Use #FB4E85 (pink) and #FBD64E (yellow) as accent colors for any highlighting needed\n- Keep text minimal and focused on must-know concepts.\n- Output only a valid Mermaid.js code block (using graph TD for vertical layout).\n- After the diagram, provide a brief explanation (1-2 sentences each) for each main area, explaining its importance for interviews and what to focus on.\n\nThe goal is a simple, visually appealing roadmap that helps prioritize interview preparation—not an exhaustive guide. Add hyperlinks to sugestive websites in the diagram. These links when clicked should open in a new tab.`;

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
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
          max_tokens: 1200,
        }),
      }
    );

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return NextResponse.json({ error: `Groq API error ${groqRes.status}: ${err}` }, { status: 500 });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || data.result || data.reply || "";
    return NextResponse.json({ roadmap: text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
