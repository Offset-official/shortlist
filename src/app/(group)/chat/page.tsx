// app/chat/page.tsx (or wherever ChatPage lives)
"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import CodeEditor from "@/components/CodeEditor";
import CameraRecorder from "@/components/CameraRecorder";
import TalkingHeadComponent from "@/components/TalkingAvatar";
import ScreenpipePanel from "@/components/ScreenpipePanel";
import { toast } from "react-hot-toast";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // Now supports "code", "camera", or "screenpipe"
  const [activeTab, setActiveTab] = useState<"code" | "camera" | "screenpipe">("code");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Ensure systemInstruction is in sessionStorage
  useEffect(() => {
    if (!sessionStorage.getItem("LLMsystemInstruction")) {
      sessionStorage.setItem(
        "LLMsystemInstruction",
        "You are a chatbot which will help candidates practice guided DSA questions. You will ask the candidate which topic they would like to practice (from linked lists, stack, queue, priority queue, trees) and then ask a DSA easy question from that topic. Then, you have to guide the conversation in such a way that the user is giving you the answer step by step. You will not give the answer to the question directly. You will only give hints and ask questions to guide the user to the answer. The user should build up the answer from brute force to optimized methods."
      );
    }
  }, []);

  // Send hidden initial prompt
  const sendHiddenMessage = async (hiddenMessage = "Hi") => {
    const userMessage = { role: "user", content: hiddenMessage };
    setLoading(true);
    try {
      const systemInstruction = sessionStorage.getItem("LLMsystemInstruction") || "";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], systemInstruction }),
      });
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      toast.success("Message sent!");
    } catch (err) {
      console.error("Error sending hidden message:", err);
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // Kick off
  const handleStartChat = async () => {
    setStarted(true);
    await sendHiddenMessage();
  };

  // User sends a message
  const handleSend = async () => {
    if (!started || !input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const systemInstruction = sessionStorage.getItem("LLMsystemInstruction") || "";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], systemInstruction }),
      });
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      toast.success("Message sent!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Scroll down on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* Left: Chat */}
      <div className="w-1/2 flex flex-col h-screen p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
        </header>

        {!started ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={handleStartChat}
              className="px-6 py-3 bg-primary text-foreground rounded hover:bg-primary/80"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 chat-scroll">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 mx-4 ${
                  idx === 0 ? "mt-4" : ""
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  {msg.role === "assistant" && <span className="text-xl">🤖</span>}
                </div>
                <div className="p-3 rounded-lg border shadow-md bg-background outline-1 outline-ring text-white">
                  <Markdown>{msg.content}</Markdown>
                </div>
                <div className="w-10 h-10 flex items-center justify-center">
                  {msg.role === "user" && <span className="text-xl">🧑</span>}
                </div>
              </div>
            ))}
            {loading && <div className="text-muted-foreground text-center">Thinking...</div>}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Message Input */}
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
            disabled={!started}
            className="flex-1 p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground resize-none overflow-hidden disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!started}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-foreground text-2xl ${
              started ? "bg-primary hover:bg-primary/90" : "bg-muted cursor-not-allowed opacity-50"
            }`}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Right: Tabs */}
      <div className="w-1/2 flex flex-col h-screen border-l border-border">
        <div className="flex items-center p-2 border-b border-border">
          <button
            className={`px-4 py-2 mr-2 rounded cursor-pointer ${
              activeTab === "code" ? "bg-accent text-black" : "bg-transparent"
            }`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded cursor-pointer ${
              activeTab === "camera" ? "bg-accent text-black" : "bg-transparent"
            }`}
            onClick={() => setActiveTab("camera")}
          >
            Camera
          </button>
          <button
            className={`px-4 py-2 rounded cursor-pointer ${
              activeTab === "screenpipe" ? "bg-accent text-black" : "bg-transparent"
            }`}
            onClick={() => setActiveTab("screenpipe")}
          >
            Screenpipe
          </button>
        </div>

        <div className="flex-1 relative">
          <div className={`${activeTab === "code" ? "block" : "hidden"} w-full h-full`}>
            <CodeEditor />
          </div>
          <div className={`${activeTab === "camera" ? "flex" : "hidden"} absolute inset-0 items-center justify-center`}>
            <CameraRecorder />
          </div>
          <div className={`${activeTab === "screenpipe" ? "flex" : "hidden"} absolute inset-0 items-center justify-center`}>
            <ScreenpipePanel />
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="fixed bottom-6 right-6 w-[300px] h-[300px] z-50">
        <TalkingHeadComponent
          text={messages.slice().reverse().find((m) => m.role === "assistant")?.content || "..."}
          gender="woman"
        />
      </div>
    </div>
  );
}
