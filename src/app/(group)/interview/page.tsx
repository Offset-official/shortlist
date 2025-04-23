'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Markdown from "react-markdown";
import CodeEditor from "@/components/CodeEditor";
import CameraRecorder from "@/components/CameraRecorder";
import TalkingHeadComponent from "@/components/TalkingAvatar";
import ScreenpipePanel from "@/components/ScreenpipePanel";

// Extract text between <SPEAKABLE> tags and clean content
function extractSpeakableContent(content: string) {
  // Extract text between <SPEAKABLE> tags
  const speakableRegex = /<SPEAKABLE>([\s\S]*?)<\/SPEAKABLE>/g;
  const speakableMatches = [...content.matchAll(speakableRegex)];
  const speakableText = speakableMatches.map(match => match[1]).join(" ");
  
  // Remove the tags from the display content
  const cleanedContent = content.replace(/<\/?SPEAKABLE>/g, "");
  
  return { speakableText, cleanedContent };
}

export default function InterviewPage() {
  const params = useSearchParams();
  const interviewId = params.get("id");
  const mock = params.get("mock") === "true";
  const router = useRouter();

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [speakableText, setSpeakableText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "camera" | "screenpipe">("code");

  // fetch system prompt from our new API
  const fetchSystemPrompt = async () => {
    const res = await fetch(`/api/getInterviewSystemPrompt?id=${interviewId}&mock=${mock}`);
    const { systemPrompt } = await res.json();
    return systemPrompt as string;
  };

  // kick off the interview
  const handleStartInterview = async () => {
    if (!interviewId) return router.push("/interview");
    setStarted(true);
    setLoading(true);
    try {
      const systemInstruction = await fetchSystemPrompt();
      const userMsg = { role: "user", content: "__START_INTERVIEW__" };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMsg], systemInstruction }),
      });
      const { reply } = await res.json();
      
      // Process the reply to extract speakable content and clean displayed content
      const { speakableText, cleanedContent } = extractSpeakableContent(reply);
      setSpeakableText(speakableText || cleanedContent);
      
      setMessages([{ role: "assistant", content: cleanedContent }]);
    } finally {
      setLoading(false);
    }
  };

  // send each user answer
  const handleSend = async () => {
    if (!input.trim() || over) return;
    const userMessage = { role: "user", content: input };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);
    try {
      // reuse same systemPrompt in sessionStorage so it persists
      const systemInstruction = sessionStorage.getItem("InterviewSystemPrompt")!;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], systemInstruction }),
      });
      const data = await res.json();
      
      // Process the reply to extract speakable content and clean displayed content
      const { speakableText, cleanedContent } = extractSpeakableContent(data.reply);
      setSpeakableText(speakableText || data.reply);
      
      setMessages((m) => [...m, { role: "assistant", content: cleanedContent }]);
      
      // Use isInterviewOver from API response rather than checking for tag
      if (data.isInterviewOver) {
        setOver(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // store the fetched system prompt once
  useEffect(() => {
    if (started) return;
    fetchSystemPrompt().then((sp) => sessionStorage.setItem("InterviewSystemPrompt", sp));
  }, [started]);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, over]);

  useEffect(() => {
    if (!over) return;
    // Save chat history and system prompt when interview ends
    const saveHistory = async () => {
      if (!interviewId) return;
      const systemPrompt = sessionStorage.getItem("InterviewSystemPrompt") || "";
      await fetch("/api/interview/save_history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: Number(interviewId),
          chatHistory: messages,
          systemPrompt,
        }),
      });
    };
    saveHistory();
    // eslint-disable-next-line
  }, [over]);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* Left: Chat */}
      <div className="w-1/2 flex flex-col h-screen p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">{over ? "Interview Complete" : "Interview"}</h1>
        </header>

        {!started ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={handleStartInterview}
              className="px-6 py-3 bg-primary text-foreground rounded hover:bg-primary/80"
            >
              Start Interview
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
                  {msg.role === "assistant" ? <Markdown>{msg.content}</Markdown> : msg.content}
                </div>
                <div className="w-10 h-10 flex items-center justify-center">
                  {msg.role === "user" && <span className="text-xl">🧑</span>}
                </div>
              </div>
            ))}
            {loading && !over && <div className="text-muted-foreground text-center">Thinking...</div>}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        {!over && (
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
              placeholder="Your answer..."
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
        )}
      </div>

      {/* Right: Tabs */}
      <div className="w-1/2 flex flex-col h-screen border-l border-border">
        <div className="flex items-center p-2 border-b border-border">
          {(["code", "camera", "screenpipe"] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 mr-2 rounded cursor-pointer ${
                activeTab === tab ? "bg-accent text-black" : "bg-transparent"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <div className={`${activeTab === "code" ? "block" : "hidden"} w-full h-full`}>
            <CodeEditor />
          </div>
          <div className={`${activeTab === "camera" ? "flex" : "hidden"} absolute inset-0 items-center justify-center`}>
          <CameraRecorder active={started && !over} interviewId={interviewId || ""}/>
          </div>
          <div className={`${activeTab === "screenpipe" ? "flex" : "hidden"} absolute inset-0 items-center justify-center`}>
            <ScreenpipePanel active = {started && !over} interviewId={interviewId || ""}/>
          </div>
        </div>
      </div>

      {/* Avatar */}
      <div className="fixed bottom-6 right-6 w-[300px] h-[300px] z-50">
        <TalkingHeadComponent
          text={speakableText}
          gender="woman"
        />
      </div>
    </div>
);
}
