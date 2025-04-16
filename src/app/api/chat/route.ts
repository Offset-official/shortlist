import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { messages, systemInstruction } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "Error: No messages provided." },
        { status: 400 }
      );
    }

    // Remove system messages
    messages = messages.filter((msg: any) => msg.role !== "system");

    const promptMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, messages.length - 1);

    const transformMessage = (msg: any) => {
      const role = msg.role === "assistant" ? "model" : msg.role;
      return {
        role,
        parts:
          typeof msg.content === "string"
            ? [{ text: msg.content }]
            : Array.isArray(msg.content?.parts)
            ? msg.content.parts
            : [{ text: String(msg.content) }],
      };
    };

    const transformedHistory = historyMessages.map(transformMessage);

    // Add a dummy "hi" from user to start of transformed history (if you want/need it)
    transformedHistory.unshift({
      role: "user",
      parts: [{ text: "hi" }],
    });

    let promptText: string;
    if (typeof promptMessage.content === "string") {
      promptText = promptMessage.content;
    } else if (Array.isArray(promptMessage.content?.parts)) {
      promptText = promptMessage.content.parts
        .map((part: any) => part.text)
        .join(" ");
    } else {
      promptText = String(promptMessage.content);
    }

    // Create the chat with model and history
    const chat = ai.chats.create({
      model: "gemini-2.0-flash-lite",
      history: transformedHistory,
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant.",
        // Limit output to 100 tokens
        maxOutputTokens: 100,
      },
    });

    const response = await chat.sendMessage({ message: promptText });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    return NextResponse.json(
      { reply: `Error: ${String(error)}` },
      { status: 500 }
    );
  }
}
