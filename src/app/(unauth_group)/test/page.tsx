"use client";

import React, { useEffect, useState } from "react";
import { pipe } from "@screenpipe/browser";

export default function TestPage() {
  const [visitCount, setVisitCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // 10-second countdown

  // The function that queries Screenpipe
  async function queryScreenpipe() {
    try {
      const oneMinuteAgo = new Date(Date.now() - 10 * 1000).toISOString();

      const results = await pipe.queryScreenpipe({
        startTime: oneMinuteAgo,
        limit: 100,
        contentType: "ocr", // could be "ocr", "audio", "ui", or "all",
        browserUrl: "chat*"
      });

      if (!results || !results.data) {
        console.log("No results found or an error occurred");
        setVisitCount(0);
        return;
      }

      console.log(`Found ${results.pagination.total} items for ChatGPT`);

      // Log each item if you want more detail
      for (const item of results.data) {
        if (item.type === "OCR") {
          console.log(`OCR content: ${JSON.stringify(item.content)}`);
        } else if (item.type === "Audio") {
          console.log(`Transcript: ${JSON.stringify(item.content)}`);
        }
      }

      // Consider each returned data item as a "visit"
      setVisitCount(results.data.length);
    } catch (error) {
      console.error("Error querying Screenpipe:", error);
      setVisitCount(0);
    }
  }

  useEffect(() => {
    // Fetch immediately on mount
    queryScreenpipe();

    // Start a 1-second interval to manage countdown and re-fetch
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => {
        // Once the timer hits 1, it's about to become 0...
        if (prev <= 1) {
          // Re-fetch data
          queryScreenpipe();
          // Reset timer to 10
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  return (
    <div>
      <h1>ChatGPT Visits in the Last 10 seconds: {visitCount}</h1>
      <p>Next fetch in {timeLeft}s</p>
      <p>Check the console for detailed Screenpipe query results.</p>
    </div>
  );
}
