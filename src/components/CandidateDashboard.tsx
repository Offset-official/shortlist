"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import {
  Activity,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  Code,
  FileText,
  Layers,
  MessageSquare,
  User,
  Video,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import RoadmapSVG from "@/components/svgs/roadmap"

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [dsaQuestions, setDsaQuestions] = useState<any[]>([])
  const [recommender, setRecommender] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [resumeScore, setResumeScore] = useState<number>(0)
  const [questionsCompleted, setQuestionsCompleted] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    // Fetch candidate profile to determine profile completion and get applied jobs/interviews
    // Use user id from session if available, else fallback to email logic if needed
    console.log(session?.user)
    if (!session?.user?.id) return;
    setLoading(true)
    axios.get(`/api/getCandidate?user_id=${session.user.id}&include=appliedJobs,interviews`)
      .then((res) => {
        const candidate = res.data
        console.log("Candidate data:", candidate)
        if (candidate) {
          if (!candidate.resume) {
            setProfileCompletion(50)
            setShowProfileCompletion(true)
          } else {
            setShowProfileCompletion(false)
            setProfileCompletion(null)
          }
          setAppliedJobs(candidate.appliedJobs || [])
          setInterviews(candidate.interviews || [])
          setResumeScore(candidate.resumeAnalysis?.overallScore || 0)
          setQuestionsCompleted(candidate.questionsCompleted || 0)
        }
        if (candidate?.dreamCompanies?.length) {
          setRecommender([
            `For your dream companies like ${candidate.dreamCompanies.join(", ")}, focus on DSA, System Design, and Core CS subjects like networks and OS.`,
          ])
        }
      })
      .finally(() => setLoading(false))
  }, [session?.user?.id])

  useEffect(() => {
    // Fetch jobs preview
    axios.get("/api/getJobs")
      .then((res) => {
        const data = res.data
        setJobs(data.jobs?.slice(0, 3) || [])
      })
  }, [])

  useEffect(() => {
    // Fetch DSA questions preview
    axios.get("/api/import-coding-problems?limit=2")
      .then((res) => {
        const data = res.data
        setDsaQuestions(data.problems || [])
      })
  }, [])

  // Dashboard stats with real data and colored icons
  const stats = [
    {
      label: "Applications",
      value: appliedJobs.length,
      icon: Briefcase,
      iconColor: "text-secondary",
    },
    {
      label: "Shortlisted",
      value: interviews.length,
      icon: Calendar,
      iconColor: "text-tertiary",
    },
    {
      label: "Resume Score",
      value: `${resumeScore}%`,
      icon: BarChart3,
      iconColor: "text-yellow",
    },
    {
      label: "Questions Completed",
      value: questionsCompleted,
      icon: CheckCircle,
      iconColor: "text-pink",
    },
  ]

  const featureCards = [
    {
      title: "DSA Preparation",
      description: "Practice coding problems and algorithms",
      icon: Code,
      href: "/dsa",
      color: "bg-tertiary text-tertiary-foreground",
    },
    {
      title: "Job Listings",
      description: "Browse and apply to matching opportunities",
      icon: Briefcase,
      href: "/jobs",
      color: "bg-tertiary text-tertiary-foreground",
      badge: "Hot",
    },
  ]

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh] bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="text-lg font-semibold">Loading your dashboard...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 py-4 px-4 lg:py-8 lg:px-10 bg-background text-foreground">
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="">
          <div className="text-3xl font-light mb-1">
            Welcome back, {session?.user?.name ? <span className="text-primary font-bold">{session.user.name}</span> : "Candidate"}
          </div>
          <div className="text-gray">
            This dashboard is crafted just for you. Track your journey, discover new opportunities, and get personalized recommendations to land your dream job.
          </div>
        </div>
        {/* Mock Interview Card */}
        <div className="flex gap-6  flex-col md:flex-row">
          <Card className="bg-gradient-to-r from-primary/10 to-card shadow-lg border-primary relative flex-1 min-w-5/8">
            <CardHeader>
              <CardTitle className=" flex items-center gap-2 text-2xl">
                <Video className="h-6 w-6 text-primary " /> Take a Mock Interview
              </CardTitle>
              <CardDescription>Simulate a real interview experience and get instant feedback tailored to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm max-w-7/8">Choose your domain, difficulty, and get started with a professional or AI-powered mock interview. This is your safe space to practice and grow. Receive detailed feedback on your answers, communication style, and technical approach to identify areas for improvement and build confidence for your real interviews.</p>
              <Button onClick={() => router.push("/mock-interview")} className="text-white bg-primary">Start Mock Interview</Button>
            </CardContent>
            {/* Avatar image anchored right */}
            <img
              src="/assets/avatar.png"
              alt="Avatar"
              className="absolute -right-5 lg:-right-20 -bottom-0 h-[10em] lg:h-[125%] pointer-events-none select-none"
              style={{ zIndex: 1 }}
            />
          </Card>
          {/* DSA Questions Preview */}
          <Card className="bg-gradient-to-l from-tertiary/5 to-card shadow-lg border-tertiary relative flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-tertiary" />
                Quick DSA Practice
              </CardTitle>
              <CardDescription className="text-xs">Boost your coding confidence with these picks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {dsaQuestions.length === 0 && <div className="text-gray text-sm">No DSA questions found.</div>}
                {dsaQuestions.map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between border-b px-3 py-1 hover:shadow-sm transition border-gray/20 cursor-pointer"
                    onClick={() => router.push("/dsa")}
                  >
                    <span className="font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap max-w-[60%]">{problem.title}</span>
                    <div className="flex flex-wrap gap-1 ml-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium border ${problem.difficulty === 'Easy' ? 'bg-tertiary text-tertiary-foreground border-tertiary' : problem.difficulty === 'Medium' ? 'bg-secondary text-secondary-foreground border-secondary' : 'bg-primary text-primary-foreground border-primary'}`}>{problem.difficulty}</span>
                      {(problem.category as string[])?.map((cat: string, i: number) => (
                        <Badge key={i} className="text-xs bg-tertiary text-tertiary-foreground border border-tertiary px-1 py-[0.25]">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full text-xs p-0 h-7 text-tertiary" onClick={() => router.push("/dsa")}>Show More</Button>
            </CardFooter>
          </Card>
        </div>


        {/* Profile Completion + Jobs + Applications/Interviews */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {profileCompletion && (
            <div className="flex-1 min-w-[280px] flex">
              <Card className="flex flex-col bg-card border border-gray/20 w-full">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                  <CardDescription className="text-gray">Complete your profile to attract more recruiters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-primary">{profileCompletion}%</span>
                    <Progress value={profileCompletion} className="h-2 flex-1 ml-4" />
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-lg mt-4 border border-secondary">
                    <p className="text-sm font-medium">
                      <span className="text-secondary-foreground">Tip:</span> Add your resume to improve your profile.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-secondary text-secondary" onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Complete Your Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          <div className="flex-1 min-w-[280px] flex">
            <Card className="flex flex-col bg-card border border-gray/20 w-full">
              <CardHeader>
                <CardTitle>Handpicked Jobs for You</CardTitle>
                <CardDescription>Opportunities that match your interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jobs.length === 0 && <div className="text-gray text-sm">No jobs found.</div>}
                  {jobs.map((job) => (
                    <div key={job.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b last:border-b-0 py-2 border-gray/20">
                      <div>
                        <div className="font-semibold text-primary-foreground">{job.title}</div>
                        <div className="text-xs text-gray">{job.Recruiter?.companyName || 'Company'} &middot; {job.location || (job.remote ? 'Remote' : 'Location not specified')}</div>
                      </div>
                      <div className="text-xs text-gray mt-1 md:mt-0">{job.salary ? job.salary : 'Salary N/A'}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full text-secondary" onClick={() => router.push("/jobs")}>Show More</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="flex-1 min-w-[280px] flex">
            <Card className="flex flex-col bg-card border border-gray/20 w-full">
              <CardHeader>
                <CardTitle className="text-xl font-extrabold text-primary-foreground">Your Applications</CardTitle>
                <CardDescription className="text-gray">Jobs you've applied for & interviews scheduled</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div>
                  <div className="flex flex-col gap-3 mb-2">
                    {appliedJobs.length === 0 && <div className="text-gray text-sm">No applications yet.</div>}
                    <ul className="space-y-2">
                      {appliedJobs.map((job: any) => (
                        <li
                          key={job.id}
                          className="flex items-center justify-between rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-1"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-primary-foreground">{job.title}</span>
                            <span className="text-xs text-gray">{job.status ? `Status: ${job.status}` : null}</span>
                          </div>
                          <span className="ml-2 text-xs text-secondary">{job.location || "Company"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3 mb-4 mt-6">
                    <span>You have <span className="text-2xl font-bold text-primary">{interviews.length}</span> interview{interviews.length > 1 ? "s" : ""} pending!</span></div>
                  <Button
                    variant="outline"
                    className="text-primary border-primary"
                    onClick={() => router.push("/interviews")}
                  >
                    Check out Scheduled Interviews
                  </Button>
                </div>
              </CardContent>
              {/* Removed CardFooter with View All button */}
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card border border-gray/20">
              <CardContent className="flex flex-col items-center text-center">
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-gray">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="flex gap-6">
          {/* Recommender Section */}
          <Card className="bg-gradient-to-br from-secondary/10 to-card border-secondary relative overflow-hidden flex-1">
            <CardHeader>
              <CardTitle>Your Personalized Study Plan</CardTitle>
              <CardDescription>Recommendations based on your dream companies</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {recommender.length === 0 && <li className="text-gray text-sm">Select your dream companies to get recommendations.</li>}
                {recommender.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
              <Button className="mt-6 bg-secondary text-secondary-foreground hover:bg-secondary/70" onClick={() => router.push('/roadmaps')}>
                Make a Roadmap
              </Button>
              {/* Roadmap SVG background */}
              <div className="absolute -bottom-10 right-0 w-64 h-64 opacity-10 pointer-events-none select-none z-0">
                <RoadmapSVG className="fill-secondary" />
              </div>
            </CardContent>
          </Card>
          {/* Feature Card 1: DSA Preparation (Yellow) */}
          <Card className="bg-gradient-to-br from-tertiary/10 to-card border-tertiary relative overflow-hidden flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-tertiary" />
                DSA Preparation
              </CardTitle>
              <CardDescription>Practice coding problems and algorithms</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="mt-6 bg-tertiary/60 text-tertiary-foreground hover:bg-tertiary/80"
                onClick={() => router.push("/dsa")}
              >
                Practice Now
              </Button>
              {/* Roadmap SVG background for visual consistency */}
              <div className="absolute -bottom-10 right-0 w-64 h-64 opacity-10 pointer-events-none select-none z-0">
                <RoadmapSVG className="fill-tertiary" />
              </div>
            </CardContent>
          </Card>
          {/* Feature Card 2: Job Listings (Pink) */}
          <Card className="bg-gradient-to-br from-pink/10 to-card border-pink relative overflow-hidden flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-pink" />
                Job Listings
                <Badge variant="secondary" className="ml-2 bg-pink text-foreground p-1.5">
                  Hot
                </Badge>
              </CardTitle>
              <CardDescription>Browse and apply to matching opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="mt-6 bg-pink/60 text-pink-foreground hover:bg-pink/80"
                onClick={() => router.push("/jobs")}
              >
                Browse Jobs
              </Button>
              {/* Roadmap SVG background for visual consistency */}
              <div className="absolute -bottom-10 right-0 w-64 h-64 opacity-10 pointer-events-none select-none z-0">
                <RoadmapSVG className="fill-pink" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  )
}


