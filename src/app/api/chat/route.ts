import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "Error: No messages provided." },
        { status: 400 }
      );
    }

    // Remove any system messages (we don't want any initial system messages)
    messages = messages.filter((msg: any) => msg.role !== "system");

    // Separate conversation history and the new user prompt.
    // The history includes all messages except the last one.
    const promptMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, messages.length - 1);

    // Transform messages to the required format:
    // - Convert "assistant" role to "model"
    // - Ensure the content is an object with a "parts" array
    const transformMessage = (msg: any) => {
      const role = msg.role === "assistant" ? "model" : msg.role;
      if (typeof msg.content === "string") {
        return {
          role,
          parts: [{ text: msg.content }],
        };
      } else if (msg.content && Array.isArray(msg.content.parts)) {
        return {
          role,
          parts: msg.content.parts,
        };
      } else {
        return {
          role,
          parts: [{ text: String(msg.content) }],
        };
      }
    };

    const transformedHistory = historyMessages.map(transformMessage);

    // Extract prompt text from the last user message.
    let promptText: string;
    if (typeof promptMessage.content === "string") {
      promptText = promptMessage.content;
    } else if (
      promptMessage.content &&
      Array.isArray(promptMessage.content.parts)
    ) {
      promptText = promptMessage.content.parts
        .map((part: any) => part.text)
        .join(" ");
    } else {
      promptText = String(promptMessage.content);
    }

    // Create a new chat session with the conversation history.
    const chat = ai.chats.create({
      model: "gemini-2.0-flash-lite",
      history: transformedHistory,
      config: {
        systemInstruction: "You are a chatbot which will help candidates practice guided DSA questions. You will ask the candidate which topic they would like to practice (from linked lists, stack, queue, priority queue, trees) and then ask a DSA easy question from that topic. Then, you have to guide the conversation in such a way that the user is giving you the answer step by step. You will not give the answer to the question directly. You will only give hints and ask questions to guide the user to the answer. The user should build up the answer from brute force to optimized methods.",
      },
    });

    // Send the new message as a prompt.
    const response = await chat.sendMessage({ message: promptText });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    return NextResponse.json(
      { reply: `Error: ${String(error)}` },
      { status: 500 }
    );
  }
}
