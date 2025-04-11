"use client";

import TextCard from "@/components/text-card"
const Home = () => {
  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">ShortList</h1>
      <p className="mb-8">Welcome to ShortList! Please select an option below to get started.</p>
      <div className="mt-8 ">
        <div className="grid grid-cols-2 gap-6">
          <TextCard href="/color_check" text="Color Check" glowColor="primary" />
          <TextCard href="/resume" text="Upload Resume" glowColor="secondary" />
          <TextCard href="/chat" text="DSA Chatbot" glowColor="tertiary" />
          <TextCard href="/chat" text="Resume Chatbot" glowColor="tertiary-1" />
          <TextCard href="/candidate/1" text="Profile" glowColor="tertiary-2" />
          <TextCard href="/jobs" text="Job Listings" glowColor="foreground" />
          <TextCard href="/interview" text="Interview Prep" glowColor="foreground-1" />
        </div>
      </div>
    </div>
  )
}



export default Home

