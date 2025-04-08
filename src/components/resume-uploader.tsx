"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUploader } from "@/components/file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function ResumeUploader(userId: Number) {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      setResumeData(null); // Reset any previous analysis
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", file);
      
      // Send the file to the API 
      const response = await fetch("/api/parsedoc", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process file");
      }
      
      const data = await response.json();
      setExtractedText(data.text);
    } catch (err: any) {
      console.error("Error extracting text:", err);
      setError(err.message || "Failed to extract text from the file. Please try a different file format.");
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

  const handleExtractJson = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      // console.log(userId);

      const response = await fetch("/api/extract_save_resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: extractedText, candidateId: userId.userId }), // hard coded for now. Waiting for Auth. 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse resume");
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResumeData(data);
    } catch (err: any) {
      console.error("Error parsing resume:", err);
      setError(err.message || "Failed to parse the resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Resume</h2>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF
          </p>
          
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
                  onClick={handleExtractJson}
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
                {resumeData && (
                  <TabsTrigger value="json">JSON Data</TabsTrigger>
                )}
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