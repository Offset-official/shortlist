"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface ResumeButtonProps {
  resume: string;
}

const ResumeButton: React.FC<ResumeButtonProps> = ({ resume }) => {
  const router = useRouter();

  const handleClick = () => {
    // console.log("i was clicked");
    // sessionStorage is only accessible in the browser (client side).
    // save system instruction as string of resume json 
    const resumeString = JSON.stringify(resume);
    const finalResumeString = `You are an assitant which should interview the user based on their resume. Upon the user's greeting, start asking the user about things on their resume and grill them. Following is the resume in a JSON format ${resumeString}`;
    sessionStorage.setItem("LLMsystemInstruction", finalResumeString);
    // console.log("System instruction set in session storage:", resumeString);

    // This navigates to the "/chat" route client-side:
    router.push('/chat');
  };

  return (
    <Button onClick={handleClick}>
      Resume Interview
    </Button>
  );
};

export default ResumeButton;
