"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import CodeEditor from "../components/CodeEditor";
import CameraRecorder from "../components/CameraRecorder"; // ✅ import here
import TalkingHeadComponent from '@/components/TalkingAvatar';
import { Assistant } from "next/font/google";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  var messageSent = false;

  // Ensure there's a systemInstruction in sessionStorage
  useEffect(() => {
    // Check if sessionStorage already has a systemInstruction
    const storedInstruction = sessionStorage.getItem("LLMsystemInstruction");
    // If not, set a custom system instruction (e.g., "you are tom cruise")
    // console.log(storedInstruction);
    if (!storedInstruction) {
      sessionStorage.setItem("LLMsystemInstruction", "You are a chatbot which will help candidates practice guided DSA questions. You will ask the candidate which topic they would like to practice (from linked lists, stack, queue, priority queue, trees) and then ask a DSA easy question from that topic. Then, you have to guide the conversation in such a way that the user is giving you the answer step by step. You will not give the answer to the question directly. You will only give hints and ask questions to guide the user to the answer. The user should build up the answer from brute force to optimized methods.");
    }
    if (!messageSent) {
      sendHiddenMessage("Hi");
      messageSent = true;
    }

  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Read the systemInstruction from sessionStorage each time
      const systemInstruction = sessionStorage.getItem("LLMsystemInstruction") || "";
      // console.log("sending prompt with the system instruction");
      // console.log(systemInstruction);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemInstruction,
        }),
      });

      const data = await res.json();
      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // do this when page loads
  const sendHiddenMessage = async (hiddenMessage: String) => {
    // 
    const userMessage = { role: "user", content: hiddenMessage };
    setLoading(true);
    try {
      // Read the systemInstruction from sessionStorage each time
      const systemInstruction = sessionStorage.getItem("LLMsystemInstruction") || "";
      // console.log("sending prompt with the system instruction");
      // console.log(systemInstruction);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemInstruction,
        }),
      });

      const data = await res.json();
      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* Left: Chat Section */}
      <div className="w-1/2 flex flex-col h-screen p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 chat-scroll">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 mx-4 ${idx === 0 ? "mt-4" : ""}`}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {msg.role === "assistant" && <span className="text-xl">🤖</span>}
              </div>
              <div className="p-3 rounded-lg border shadow-md bg-background outline outline-1 outline-ring text-white">
                <div className="whitespace-pre-wrap">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                {msg.role === "user" && <span className="text-xl">🧑</span>}
              </div>
            </div>
          ))}
          {loading && <div className="text-muted-foreground text-center">Thinking...</div>}
          <div ref={bottomRef} />
        </div>

        <div className="mt-4 flex items-end gap-2 bg-muted p-2 rounded-lg">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask something..."
            className="flex-1 p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground resize-none overflow-hidden"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-foreground text-2xl"
          >
            ↑
          </button>
        </div>
      </div>

      {/* Right: Code Editor */}
      <div className="w-1/2 flex flex-col h-screen">
        <CodeEditor />
      </div>

      {/* ✅ Webcam */}
      <CameraRecorder />

      <div className="fixed bottom-6 right-6 w-[300px] h-[300px] z-50">
      {messages.length > 0 && (
        <div className="w-[300px] h-[300px] relative overflow-hidden rounded-lg shadow-xl">
          <TalkingHeadComponent text={messages.findLast((msg) => msg.role === "assistant")?.content || "Thinking..."} gender="woman" />
        </div>
      )}
      </div>

      {/* Custom scrollbar styles */}

      <style jsx>{`
        .chat-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
      `}</style>
    </div>
  );
}
