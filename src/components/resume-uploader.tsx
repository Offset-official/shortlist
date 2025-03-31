"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractTextFromResume } from "@/lib/resume-parser";
import { FileUploader } from "@/components/file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ResumeUploader() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      
      const text = await extractTextFromResume(file);
      setExtractedText(text);
    } catch (err) {
      console.error("Error extracting text:", err);
      setError("Failed to extract text from the file. Please try a different file format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upload Resume</h2>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOCX, DOC, RTF, TXT
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
              <h2 className="text-xl font-semibold">Extracted Text</h2>
              <Button variant="outline" size="sm" onClick={handleCopyText}>
                Copy Text
              </Button>
            </div>
            
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="raw">Raw Text</TabsTrigger>
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
