"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import CodeEditor from "../components/CodeEditor";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Webcam state and refs
  const [stream, setStream] = useState<MediaStream | null>(null);
  // permissionStatus can be "waiting", "granted", or "denied"
  const [permissionStatus, setPermissionStatus] = useState("waiting");
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Request webcam access when component mounts.
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        setPermissionStatus("granted");
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setPermissionStatus("denied");
      });

    // Cleanup: stop all tracks when component unmounts.
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Only run once on mount

  const toggleRecording = () => {
    if (!stream) return;

    if (!isRecording) {
      // Start recording
      try {
        const options = { mimeType: "video/webm" };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          console.log("Recorded video blob:", blob);
          // Optionally, you can create a download URL:
          // const url = URL.createObjectURL(blob);
          // console.log("Video URL:", url);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting recording:", err);
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // You can update systemInstruction if needed.
      const systemInstruction = "";
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

  // Auto-resize textarea as the input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Auto-scroll chat to the bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left: Chat Section */}
      <div className="w-1/2 flex flex-col h-screen p-4 bg-background text-card-foreground">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Chat</h1>
        </header>
        {/* Messages container with custom scrollbar */}
        <div className="flex-1 overflow-y-auto space-y-4 chat-scroll">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 mx-4 ${idx === 0 ? "mt-4" : ""}`}
            >
              {/* Left icon: only for assistant messages */}
              <div className="w-10 h-10 flex items-center justify-center">
                {msg.role === "assistant" && <span className="text-xl">🤖</span>}
              </div>
              {/* Message bubble */}
              <div className="p-3 rounded-lg border shadow-md bg-background outline outline-1 outline-ring text-white">
                <div className="whitespace-pre-wrap">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
              {/* Right icon: only for user messages */}
              <div className="w-10 h-10 flex items-center justify-center">
                {msg.role === "user" && <span className="text-xl">🧑</span>}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-muted-foreground text-center">Thinking...</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar container with muted background */}
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

      {/* Right: Editor Section */}
      <div className="w-1/2 flex flex-col h-screen">
        <CodeEditor />
      </div>

      {/* Webcam view at the bottom right */}
      <div className="fixed bottom-4 right-4 p-4 bg-muted rounded-lg shadow-lg">
        {permissionStatus === "waiting" && <p>Waiting for permission...</p>}
        {permissionStatus === "denied" && <p>Permission not given</p>}
        {permissionStatus === "granted" && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-64 h-48 rounded-lg bg-black"
            />
            <button
              onClick={toggleRecording}
              className="mt-2 px-4 py-2 bg-primary text-white rounded"
            >
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          </>
        )}
      </div>

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
