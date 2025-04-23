"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUploader } from "@/components/file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

// Define the type for parsed resume data
type ResumeData = {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedIn?: string;
  };
  summary?: string;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    dates?: string;
    gpa?: string;
    achievements?: string[];
  }>;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    dates?: string;
    responsibilities?: string[];
    achievements?: string[];
  }>;
  skills?: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }>;
};

export function ResumeUploader({ userId }: { userId: string }) {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  // Handle uploading the file and extracting text
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      setResumeData(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parsedoc", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Failed to extract text from resume");
        throw new Error(errorData.error || "Failed to process file");
      }

      const data = await response.json();
      setExtractedText(data.text);
      toast.success("Resume text extracted successfully");
    } catch (err: any) {
      console.error("Error extracting text:", err);
      setError(err.message || "Failed to extract text from the file.");
      toast.error("An error occurred while extracting resume text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const handleCopyJson = () => {
    if (resumeData) {
      navigator.clipboard.writeText(JSON.stringify(resumeData, null, 2));
    }
  };

  // Trigger parsing and saving of resume, then analysis
  const handleExtractAnalyseJson = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const response = await fetch("/api/extract_save_resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, candidateId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Failed to parse and save resume");
        throw new Error(errorData.error || "Failed to parse resume");
      }

      const parsed: ResumeData = await response.json();
      setResumeData(parsed);
      toast.success("Resume parsed and saved successfully");

      // Immediately analyze using the parsed object, not state
      await handleResumeAnalysis(parsed);
    } catch (err: any) {
      console.error("Error parsing resume:", err);
      setError(err.message || "Failed to parse the resume.");
      toast.error("An error occurred while parsing resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Accepts the parsed resume object directly
  const handleResumeAnalysis = async (parsedResume: ResumeData) => {
    try {
      const res = await fetch("/api/resume_analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: userId, resume: parsedResume }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error("Failed to analyze resume");
        throw new Error(errorData.error || "Resume analysis failed");
      }
      // Optionally handle result of analysis
      const analysisResult = await res.json();
      console.log("Analysis result:", analysisResult);
      toast.success("Resume analyzed successfully");
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      setError(err.message || "Resume analysis error.");
      toast.error("An error occurred while analyzing resume");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Resume</h2>
          <p className="text-sm text-muted-foreground">Supported formats: PDF</p>

          <FileUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            acceptedFileTypes={{
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/rtf': ['.rtf'],
              'text/plain': ['.txt'],
            }}
          />

          {error && (
            <div className="text-sm p-3 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
        </div>
      </Card>

      {extractedText && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Extracted Content</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopyText}>
                  Copy Text
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleExtractAnalyseJson}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Processing..." : "Parse to JSON"}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
                {resumeData && <TabsTrigger value="json">JSON Data</TabsTrigger>}
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <div className="bg-muted/50 p-4 rounded-md max-h-[500px] overflow-y-auto">
                  {extractedText.split('\n').map((line, i) => (
                    <p key={i} className={line.trim() === '' ? 'h-4' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <textarea
                  className="w-full h-[500px] p-4 font-mono text-sm bg-muted/50 rounded-md resize-none"
                  value={extractedText}
                  readOnly
                />
              </TabsContent>

              {resumeData && (
                <TabsContent value="json" className="mt-4">
                  <div className="flex justify-end mb-2">
                    <Button variant="outline" size="sm" onClick={handleCopyJson}>
                      Copy JSON
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md max-h-[500px] overflow-y-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(resumeData, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            <div className="text-xs text-muted-foreground">
              Extracted from: {fileName}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
