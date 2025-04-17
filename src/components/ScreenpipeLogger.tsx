"use client";

import { JSX, useEffect, useRef, useState } from "react";
import { pipe } from "@screenpipe/browser";
import { Badge } from "@/components/ui/badge";

type Status = "retry" | "init" | "ready" | "error";

export default function ScreenpipeLogger() {
  const [status, setStatus] = useState<Status>("retry");
  const [initCountdown, setInitCountdown] = useState(5);
  const [bad, setBad] = useState(false);
  const [googleDetected, setGoogleDetected] = useState(false);
  const [chatgptDetected, setChatgptDetected] = useState(false);

  const retryTimer = useRef<NodeJS.Timeout | null>(null);
  const retryInterval = useRef<NodeJS.Timeout | null>(null);
  const initCountdownInterval = useRef<NodeJS.Timeout | null>(null);
  const readyInterval = useRef<NodeJS.Timeout | null>(null);

  // 1) RETRY phase: try for 5 s at 1 Hz
  useEffect(() => {
    if (status !== "retry") return;
    const fetchOnce = async () => {
      try {
        const res = await pipe.queryScreenpipe({
          startTime: new Date(Date.now() - 10_000).toISOString(),
          limit: 10,
          contentType: "ocr",
        });
        console.log("📥", res);
        // immediately go to INIT
        setStatus("init");
        postDiagnostics(res);
      } catch {
        /* ignore */
      }
    };
    fetchOnce();
    retryInterval.current = setInterval(fetchOnce, 1_000);
    retryTimer.current = setTimeout(() => setStatus("error"), 5_000);

    return () => {
      clearInterval(retryInterval.current!);
      clearTimeout(retryTimer.current!);
    };
  }, [status]);

  // 2) INIT phase: countdown 5→0 then READY
  useEffect(() => {
    if (status !== "init") return;
    setInitCountdown(5);
    initCountdownInterval.current = setInterval(() => {
      setInitCountdown((c) => {
        if (c <= 1) {
          clearInterval(initCountdownInterval.current!);
          setStatus("ready");
          return 0;
        }
        return c - 1;
      });
    }, 1_000);

    return () => {
      clearInterval(initCountdownInterval.current!);
    };
  }, [status]);

  // 3) READY phase: poll every 10 s
  useEffect(() => {
    if (status !== "ready") return;
    const doFetch = async () => {
      try {
        const res = await pipe.queryScreenpipe({
          startTime: new Date(Date.now() - 10_000).toISOString(),
          limit: 10,
          contentType: "ocr",
        });
        postDiagnostics(res);
        analyze(res);
      } catch {
        setStatus("retry");
      }
    };
    doFetch();
    readyInterval.current = setInterval(doFetch, 10_000);

    return () => clearInterval(readyInterval.current!);
  }, [status]);

  function analyze(results: any) {
    let isBad = false, g = false, c = false;
    results.data?.forEach((item: any) => {
      if (item.type !== "OCR") return;
      const name = item.content.windowName?.toLowerCase() || "";
      if (!name.includes("connecting talent with opportunities")) isBad = true;
      if (name.includes("google")) g = true;
      if (name.includes("chatgpt")) c = true;
    });
    setBad(isBad);
    setGoogleDetected(g);
    setChatgptDetected(c);
  }

  function postDiagnostics(results: any) {
    fetch("/api/diagnostics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        poseData: null,
        faceData: null,
        cameraImage: null,
        screenpipeData: results,
      }),
    }).catch(console.error);
  }

  // Render UI
  let badge: JSX.Element;
  switch (status) {
    case "retry":
      badge = <Badge className="bg-orange-400 text-black">Retrying for 5s…</Badge>;
      break;
    case "init":
      badge = (
        <Badge className="bg-yellow-400 text-black">
          Initializing… {initCountdown}s
        </Badge>
      );
      break;
    case "ready":
      badge = bad ? (
        <>
          <Badge variant="destructive">Suspicious Activity Detected</Badge>
          {googleDetected && (
            <Badge variant="destructive" className="mt-2">
              Google is not allowed
            </Badge>
          )}
          {chatgptDetected && (
            <Badge variant="destructive" className="mt-2">
              ChatGPT is not allowed
            </Badge>
          )}
        </>
      ) : (
        <Badge className="bg-green-400 text-black">All Clear</Badge>
      );
      break;
    default:
      badge = (
        <Badge variant="destructive">
          Screenpipe not found after 5s. Please start back‑end & refresh.
        </Badge>
      );
  }

  return <div className="flex flex-col items-center justify-center h-full w-full space-y-2">{badge}</div>;
}
