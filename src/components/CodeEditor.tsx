"use client";

import { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";

import "prismjs/themes/prism-tomorrow.css";

// Define the languages you want to support
type SupportedLang = "javascript" | "python" | "java" | "c" | "cpp";

export default function CodeEditor() {
  const [code, setCode] = useState("// type your code here\n");
  const [language, setLanguage] = useState<SupportedLang>("javascript");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex flex-col bg-card border border-border rounded shadow-lg h-full">
        {/* Header with Language Selector and Copy Button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <label htmlFor="language" className="text-sm text-foreground">
              Language:
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLang)}
              className="bg-card border border-border text-foreground text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <button
            onClick={handleCopy}
            className="text-sm text-foreground bg-card hover:bg-muted px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto p-4">
          <Editor
            value={code}
            onValueChange={(newCode) => setCode(newCode)}
            highlight={(code) => highlight(code, languages[language], language)}
            padding={12}
            className="outline-none bg-background text-foreground font-mono text-sm min-h-full"
          />
        </div>
      </div>
    </div>
  );
}
