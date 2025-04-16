"use client";

import React, { useEffect } from "react";
import { ResumeUploader } from "@/components/resume-uploader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // When the status is done loading, if there's no session redirect to /login.
  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // Show a loading indicator if still loading or there's no session.
  if (status === "loading" || !session) {
    return <p>Loading...</p>;
  }

// console.log(session.user.id);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Student Onboarding!
          </h1>
          <p className="text-muted-foreground">
            Upload your resume and we'll convert it to plain text
          </p>
        </div>

        {/* Pass the user ID from the session to ResumeUploader */}
        <ResumeUploader userId={session.user?.id} />
      </div>
    </main>
  );
}
