"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import CodeEditor from "../components/CodeEditor";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
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

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex bg-black text-white min-h-screen">
      {/* Left: Chat Section */}
      <div className="w-1/2 flex flex-col h-screen border-r border-gray-700">
        {/* Messages container: scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === "user" ? "bg-gray-800 self-end" : "bg-gray-700 self-start"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          <div ref={bottomRef} />
          {loading && <div className="text-gray-400">Thinking...</div>}
        </div>

        {/* Input bar at bottom */}
        <div className="p-4 border-t border-gray-700 bg-black flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="Ask something..."
          />
          <button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* Right: Editor Section */}
      <div className="w-1/2 flex flex-col h-screen">
        <CodeEditor />
      </div>
    </div>
  );
}
