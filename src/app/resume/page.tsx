import { ResumeUploader } from "@/components/resume-uploader";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Student Onboarding!</h1>
          <p className="text-muted-foreground">
            Upload your resume and we'll convert it to plain text
          </p>
        </div>
        
        <ResumeUploader />
      </div>
    </main>
  );
}
