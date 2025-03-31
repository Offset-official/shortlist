"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import CodeEditor from "../components/CodeEditor";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    // Append the new message to the conversation.
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send the entire conversation (history + new message) to the API.
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

  // Automatically scroll to the bottom when messages update.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-screen">
      {/* Left: Chat Section */}
      <div className="w-1/2 flex flex-col h-screen bg-gray-900 text-white p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
        </header>
        {/* Messages container with custom scrollbar */}
        <div className="flex-1 overflow-y-auto space-y-4 chat-scroll">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg shadow-md max-w-md mx-auto ${
                msg.role === "user" ? "bg-blue-600" : "bg-gray-800"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {loading && (
            <div className="text-gray-400 text-center">Thinking...</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
            placeholder="Ask something..."
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Right: Editor Section */}
      <div className="w-1/2 flex flex-col h-screen">
        <CodeEditor />
      </div>

      <style jsx>{`
        .chat-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background-color: #555;
          border-radius: 4px;
        }
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: #555 transparent;
        }
      `}</style>
    </div>
  );
}
