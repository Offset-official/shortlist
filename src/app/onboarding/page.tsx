"use client";
import { useSearchParams } from "next/navigation";
import CandidateOnboarding from "@/components/CandidateOnboarding";
import RecruiterOnboarding from "@/components/RecruiterOnboarding";

const Onboarding = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {type === "recruiter" ? <RecruiterOnboarding /> : <CandidateOnboarding />}
    </div>
  );
}

export default Onboarding;