"use client";

import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function RoadmapsPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mermaidCode, setMermaidCode] = useState("");
  const [error, setError] = useState("");
  const [svg, setSvg] = useState("");
  const [correctionWarning, setCorrectionWarning] = useState("");

  // Init Mermaid once
  useEffect(() => {
    if (typeof window !== "undefined" && mermaid.initialize) {
      mermaid.initialize({ startOnLoad: false });
    }
  }, []);

  // Re-render whenever mermaidCode changes
  useEffect(() => {
    if (mermaidCode && typeof window !== "undefined" && mermaid.render) {
      let code = mermaidCode;

      // 1. Arrow fix: `-->…|>` → `-->|…|`
      code = code.replace(
        /-->\|([^|]+)\|>\s*([^\n]+)/g,
        "-->|$1|$2"
      );

      // 2. ID fix: `X/Y` → `X_Y`
      code = code.replace(
        /([A-Za-z0-9_]+)\/([A-Za-z0-9_]+)/g,
        "$1_$2"
      );

      // Force vertical layout by replacing 'graph LR' or 'graph RL' with 'graph TD'
      code = code.replace(/graph\s+(LR|RL)/i, 'graph TD');

      if (code !== mermaidCode) {
        setCorrectionWarning(
          ""
        );
      } else {
        setCorrectionWarning("");
      }

      (async () => {
        try {
          const { svg } = await mermaid.render("roadmapSvg", code);
          setSvg(svg);
          setError("");
        } catch (err: any) {
          setError("Failed to render mermaid diagram: " + err.message);
        }
      })();
    }
  }, [mermaidCode]);

  // Fetch and extract Mermaid block
  async function handleGenerate() {
    setLoading(true);
    setError("");
    setMermaidCode("");
    setSvg("");
    setCorrectionWarning("");

    try {
      const res = await fetch("/api/getRoadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: input }),
      });
      if (!res.ok) throw new Error("Failed to fetch roadmap");
      const data = await res.json();

      let text = data.roadmap || "";
      if (typeof text === "object" && text.reply) text = text.reply;

      const match = text.match(/```mermaid[\r\n]+([\s\S]*?)```/i);
      let code = match ? match[1].trim() : "";
      if (!code && text.trim().startsWith("```mermaid")) {
        code = text.trim().replace(/^```mermaid[\r\n]*/i, "").trim();
      }

      if (code) setMermaidCode(code);
      else setError("No mermaid code block found.\n\n" + text);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] w-full py-8 px-2">
      <Card className="w-full max-w-3xl bg-card border border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary mb-2">Career Roadmap Generator</CardTitle>
          <CardDescription className="mb-4 text-muted-foreground">
            Instantly generate a clean, interview-focused roadmap for any tech role. Visualize your path from basics to "Interview Ready" with just a few clicks.
          </CardDescription>
          <div className="flex flex-col md:flex-row gap-2 items-center w-full">
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Scientist, DevOps..."
              className="flex-1 min-w-[200px]"
              disabled={loading}
            />
            <Button
              className="w-full md:w-auto"
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
            >
              {loading ? "Generating..." : "Generate Roadmap"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-destructive text-sm my-4">
              {error}
              {mermaidCode && (
                <pre className="bg-muted/30 text-xs p-2 rounded mt-2 overflow-x-auto border border-muted-foreground/10">
                  {mermaidCode}
                </pre>
              )}
            </div>
          )}
          {correctionWarning && (
            <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2 my-2 text-xs">
              {correctionWarning}
            </div>
          )}
          {svg && (
            <div className="flex justify-center items-center w-full overflow-x-auto my-6" style={{ position: 'relative' }}>
              {/* Hint is now absolutely positioned in the top-right of the diagram container */}
              <div style={{
                position: 'absolute',
                top: 24,
                right: 24,
                zIndex: 30,
                pointerEvents: 'auto',
              }}>
                <ZoomHint />
              </div>
              <div style={{ width: "100%", minWidth: 800, maxWidth: 1400, minHeight: 600, position: "relative" }}>
                <TransformWrapper
                  initialScale={1}
                  minScale={0.2}
                  maxScale={5}
                  wheel={{ step: 0.1 }}
                  doubleClick={{ disabled: true }}
                  panning={{ velocityDisabled: true }}
                >
                  <TransformComponent>
                    <div
                      style={{ width: "100%", height: "600px" }}
                      dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg width="100%" height="600px" ') }}
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

// Animated zoom icon with tooltip
function ZoomHint() {
  const [showTip, setShowTip] = React.useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowTip(false), 3500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        top: 18,
        right: 22,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        cursor: "zoom-in",
      }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--card)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        border: "1.5px solid var(--primary)",
      }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="9" cy="9" r="7"/><line x1="15" y1="15" x2="19" y2="19" strokeLinecap="round"/><line x1="9" y1="5" x2="9" y2="13"/><line x1="5" y1="9" x2="13" y2="9"/></svg>
      </span>
      {showTip && (
        <span style={{
          marginLeft: 10,
          background: "var(--card)",
          color: "var(--primary)",
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          padding: "6px 14px",
          whiteSpace: "nowrap",
          border: "1px solid var(--primary)",
          transition: "opacity 0.2s",
        }}>
          Tip: Zoom & pan with scroll, drag, or pinch
        </span>
      )}
      <style>{`
        @keyframes zoomPulse {
          0% { box-shadow: 0 0 0 0 var(--primary); }
          70% { box-shadow: 0 0 0 10px var(--primary); opacity: 0.15; }
          100% { box-shadow: 0 0 0 0 var(--primary); }
        }
      `}</style>
    </div>
  );
}
