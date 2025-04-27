"use client";
import { Suspense } from "react";
import CandidateOnboarding from "@/components/CandidateOnboarding";
import RecruiterOnboarding from "@/components/RecruiterOnboarding";
import { toast } from "react-hot-toast";

// Create a client component that uses useSearchParams
import { useSearchParams } from "next/navigation";

const OnboardingClient = () => {
  const searchParams = useSearchParams();
  const type = searchParams ? searchParams.get("type") : null;

  const handleOnboarding = async (formData: any) => {
    try {
      // ...existing code...
      toast.success("Onboarding complete!");
      // ...existing code...
    } catch (err) {
      toast.error("An error occurred during onboarding.");
    }
  };
  
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