"use client";

import React, { useState, useEffect } from "react";
import mermaid from "mermaid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a career roadmap for the role: ${input}. Respond ONLY with a mermaid js code block.
              
              Please focus on only the 5-6 most essential concept areas that interviewers commonly ask about, with just 2-3 key subtopics under each.  

Make the diagram visually clean with:
- A clear linear progression from start to "Interview Ready"
- Use a vertical layout
- Start with graph TD and not graph LR
- Distinct visual styling for main topics vs subtopics
- Minimal text that focuses on must-know concepts
- Use this specific color scheme:
  - Main nodes: fill:#E55D3F, stroke:#0B0C0E, color:#FFFFFF
  - Subtopic nodes: fill:#FFFFFF, stroke:#E2E2E2
  - Start/End nodes: fill:#25C66E, stroke:#0B0C0E, color:#FFFFFF
  - Connection lines: stroke:#3F96DA, stroke-width:2px
  - Use #FB4E85 (pink) and #FBD64E (yellow) as accent colors for any highlighting needed
              Respond ONLY with a mermaid js code block and no preceding text.`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to fetch roadmap");
      const data = await res.json();

      let text =
        data.choices?.[0]?.message?.content ||
        data.result ||
        data.reply ||
        "";
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
            <div className="flex justify-center items-center w-full overflow-x-auto my-6">
              <div
                style={{ minWidth: 800, maxWidth: 1400, minHeight: 600 }}
                className="flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg width="100%" height="600px" ') }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
