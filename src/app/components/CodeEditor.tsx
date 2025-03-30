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

  return (
    <div className="flex flex-col h-full">
      {/* Language Selector Bar */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <label htmlFor="language" className="mr-2">
          Language:
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as SupportedLang)}
          className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 overflow-auto">
        <Editor
          value={code}
          onValueChange={(newCode) => setCode(newCode)}
          highlight={(code) => highlight(code, languages[language], language)}
          padding={12}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            minHeight: "100%",
          }}
          className="border border-gray-700 rounded"
        />
      </div>
    </div>
  );
}
