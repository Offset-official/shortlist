'use client';

import { useEffect, useRef, useState } from "react";

export default function TalkingHeadComponent() {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState("Loading...");
  const [text, setText] = useState("Hi there. How are you? I'm fine.");
  const [head, setHead] = useState<any>(null);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    let headInstance: any;
    let intervalId: NodeJS.Timeout;

    const initTalkingHead = async () => {
      try {
        const TalkingHead = (window as any).TalkingHead;
        if (!TalkingHead) {
          throw new Error("TalkingHead not available. Ensure the script is loaded.");
        }
        console.log("Initializing TalkingHead:", TalkingHead);

        headInstance = new TalkingHead(avatarRef.current, {
            ttsEndpoint: "/api/tts", 
            ttsApikey: "", 
            lipsyncModules: ["en"],
            cameraView: "upper",
          });
          

        setHead(headInstance);

        await headInstance.showAvatar(
          {
            url: "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
            body: "F",
            avatarMood: "neutral",
            ttsLang: "en-GB",
            ttsVoice: "en-GB-Standard-A",
            lipsyncLang: "en",
          },
          (ev: ProgressEvent) => {
            if (ev.lengthComputable) {
              const percent = Math.min(100, Math.round((ev.loaded / ev.total) * 100));
              setLoading(`Loading ${percent}%`);
            }
          }
        );

        setShowLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(error instanceof Error ? error.message : String(error));
      }
    };

    if (typeof window !== "undefined") {
      // Poll for TalkingHead availability
      let attempts = 0;
      const maxAttempts = 100; 
      intervalId = setInterval(() => {
        console.log("Checking TalkingHead:", (window as any).TalkingHead);
        if ((window as any).TalkingHead) {
          clearInterval(intervalId);
          initTalkingHead();
        } else if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setLoading("Failed to load TalkingHead library after timeout.");
        }
        attempts++;
      }, 100);
    }

    const handleVisibilityChange = () => {
      if (!headInstance) return;
      document.visibilityState === "visible" ? headInstance.start() : headInstance.stop();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSpeak = () => {
    if (head && text) head.speakText(text);
  };

  return (
    <div className="bg-gray-800 text-white w-full h-full max-w-3xl mx-auto relative">
      <div ref={avatarRef} className="block w-full h-full"></div>
      <div className="absolute top-10 left-10 right-10 h-12">
        <input
          className="absolute w-full h-full text-xl right-28"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="absolute right-0 h-full w-24 text-xl"
          onClick={handleSpeak}
        >
          Speak
        </button>
      </div>
      {showLoading && (
        <div className="absolute bottom-10 left-10 right-10 h-12 text-xl">{loading}</div>
      )}
    </div>
  );
}