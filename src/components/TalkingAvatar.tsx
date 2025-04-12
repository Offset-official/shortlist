'use client';

import { useCallback, useEffect, useRef, useState } from "react";

export default function TalkingHeadComponent({ text: externalText, gender } : { text: string, gender: string }) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState("Loading...");
  const [text, setText] = useState(externalText);
  const [head, setHead] = useState<any>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [isAvatarReady, setIsAvatarReady] = useState(false); // prevents unwanted calls to headinstance before it's ready


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
            url: `/models/${gender}.glb`,
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

        setHead(headInstance);
        setIsAvatarReady(true);

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

  const lastSpokenText = useRef<string | null>(null); // to handle repeated calls during development

  const handleSpeak = useCallback(() => {
    if (head && isAvatarReady && externalText && externalText !== lastSpokenText.current) {
      head.speakText(externalText);
      lastSpokenText.current = externalText;
    }
  }, [head, isAvatarReady, externalText]);

  useEffect(() => {
    if (isAvatarReady && externalText) {
      handleSpeak();
      setText(externalText);
    }
  }, [externalText, isAvatarReady, handleSpeak]);

  return (
    <div className="text-white w-full h-full max-w-3xl mx-auto relative">
      <div ref={avatarRef} className="block w-full h-full"></div>
      {showLoading && (
        <div className="absolute bottom-10 left-10 right-10 h-12 text-xl">{loading}</div>
      )}
    </div>
  );
}