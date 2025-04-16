"use client";
import { Suspense } from "react";
import CandidateOnboarding from "@/components/CandidateOnboarding";
import RecruiterOnboarding from "@/components/RecruiterOnboarding";

// Create a client component that uses useSearchParams
import { useSearchParams } from "next/navigation";

const OnboardingClient = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  return (
    <>
      {type === "recruiter" ? <RecruiterOnboarding /> : <CandidateOnboarding />}
    </>
  );
};

// Main component with Suspense boundary
const Onboarding = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <OnboardingClient />
      </Suspense>
    </div>
  );
};

export default Onboarding;