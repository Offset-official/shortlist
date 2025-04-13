"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import CodeEditor from "../components/CodeEditor";
import CameraRecorder from "../components/CameraRecorder";
import TalkingHeadComponent from "@/components/TalkingAvatar";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Tracks if the user has started the chat yet
  const [started, setStarted] = useState(false);

  // Tab switching
  const [activeTab, setActiveTab] = useState<"code" | "camera">("code");

  // Refs for scrolling and auto-resizing the textarea
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Ensure there's a systemInstruction in sessionStorage
  useEffect(() => {
    const storedInstruction = sessionStorage.getItem("LLMsystemInstruction");
    if (!storedInstruction) {
      sessionStorage.setItem(
        "LLMsystemInstruction",
        "You are a chatbot which will help candidates practice guided DSA questions. You will ask the candidate which topic they would like to practice (from linked lists, stack, queue, priority queue, trees) and then ask a DSA easy question from that topic. Then, you have to guide the conversation in such a way that the user is giving you the answer step by step. You will not give the answer to the question directly. You will only give hints and ask questions to guide the user to the answer. The user should build up the answer from brute force to optimized methods."
      );
    }
  }, []);

  // ---------------------------------------
  // Hidden "initial" message function
  // ---------------------------------------
  const sendHiddenMessage = async (hiddenMessage: string = "Hi") => {
    // Construct a "user" role message, but this won't come from user input.
    const userMessage = { role: "user", content: hiddenMessage };
    setLoading(true);

    try {
      const systemInstruction = sessionStorage.getItem("LLMsystemInstruction") || "";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemInstruction,
        }),
      });

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending hidden message:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // Manually Start the Chat
  // ---------------------------------------
  const handleStartChat = async () => {
    setStarted(true);
    // Automatically send a hidden initial message after the user starts the chat
    await sendHiddenMessage();
  };

  // ---------------------------------------
  // Sending normal user messages
  // ---------------------------------------
  const handleSend = async () => {
    // Only proceed if chat has started
    if (!started) return;

    // Only send non-empty input
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const systemInstruction = sessionStorage.getItem("LLMsystemInstruction") || "";

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

  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* Left: Chat Section */}
      <div className="w-1/2 flex flex-col h-screen p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
        </header>

        {/* If chat is not started, show "Start Chat" button. Otherwise, show the conversation. */}
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
        )}

        {/* Message Input Row */}
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
            className={`w-10 h-10 flex items-center justify-center rounded-full text-foreground text-2xl 
              ${
                started
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-muted cursor-not-allowed opacity-50"
              }`}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Right: Tabbed Section */}
      <div className="w-1/2 flex flex-col h-screen border-l border-border">
        {/* Top Bar with tabs */}
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
            className={`px-4 py-2 rounded cursor-pointer ${
              activeTab === "camera" ? "bg-accent text-black" : "bg-transparent"
            }`}
            onClick={() => setActiveTab("camera")}
          >
            Camera
          </button>
        </div>

        {/* Main Content: either CodeEditor or Camera in center */}
        <div className="flex-1">
          {activeTab === "code" ? (
            <CodeEditor />
          ) : (
            <div className="h-full flex items-center justify-center">
              <CameraRecorder />
            </div>
          )}
        </div>
      </div>

      {/* Avatar in bottom-right */}
      <div className="fixed bottom-6 right-6 w-[300px] h-[300px] z-50">
        {/* The avatar is always visible (no overlay). */}
        <div className="w-[300px] h-[300px] relative overflow-hidden">
          <TalkingHeadComponent
            text={
              messages.findLast((msg) => msg.role === "assistant")?.content || "..."
            }
            gender="woman"
          />
        </div>
      </div>

    </div>
  );
}
