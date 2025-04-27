"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const [profileCompletion] = useState(85)
  const [jobs, setJobs] = useState<any[]>([])
  const [dsaQuestions, setDsaQuestions] = useState<any[]>([])
  const [recommender, setRecommender] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    // Fetch jobs preview
    fetch("/api/getJobs")
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs?.slice(0, 3) || []))
  }, [])

  useEffect(() => {
    // Fetch DSA questions preview
    fetch("/api/import-coding-problems?limit=2")
      .then((res) => res.json())
      .then((data) => setDsaQuestions(data.problems || []))
  }, [])

  useEffect(() => {
    // Fetch recommended topics based on dream companies
    fetch("/api/getCandidate")
      .then((res) => res.json())
      .then((data) => {
        // Example: recommend topics based on dreamCompanies field
        if (data.candidate?.dreamCompanies?.length) {
          // This is a placeholder. Replace with your actual logic/API.
          setRecommender([
            `For ${data.candidate.dreamCompanies.join(", ")}, focus on DSA, System Design, and Core CS subjects.`,
            "Practice company-specific interview questions."
          ])
        }
      })
  }, [])

  // Sample data for the dashboard
  const stats = [
    { label: "Applications", value: "12", icon: Briefcase, color: "text-[var(--color-secondary)]" },
    { label: "Interviews", value: "3", icon: Calendar, color: "text-[var(--color-tertiary)]" },
    { label: "Skills Score", value: "78%", icon: BarChart3, color: "text-[var(--color-tertiary-1)]" },
    { label: "Saved Jobs", value: "8", icon: CheckCircle, color: "text-[var(--color-tertiary-2)]" },
  ]

  const featureCards = [
    {
      title: "AI Interview Prep",
      description: "Practice interviews with AI feedback",
      icon: Video,
      href: "/interview",
      color: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]",
      badge: "Popular",
    },
    {
      title: "Resume Analyzer",
      description: "Get AI-powered feedback on your resume",
      icon: FileText,
      href: "/resume",
      color: "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]",
    },
    {
      title: "Mock Interviews",
      description: "Schedule practice interviews with professionals",
      icon: MessageSquare,
      href: "/mock-interview",
      color: "bg-[var(--color-tertiary-1)]/10 text-[var(--color-tertiary-1)]",
    },
    {
      title: "DSA Preparation",
      description: "Practice coding problems and algorithms",
      icon: Code,
      href: "/dsa",
      color: "bg-[var(--color-tertiary-2)]/10 text-[var(--color-tertiary-2)]",
    },
    {
      title: "Career Roadmaps",
      description: "Personalized career development paths",
      icon: Layers,
      href: "/roadmaps",
      color: "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]",
    },
    {
      title: "Job Listings",
      description: "Browse and apply to matching opportunities",
      icon: Briefcase,
      href: "/jobs",
      color: "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]",
      badge: "New",
    },
    {
      title: "Skills Assessment",
      description: "Test your technical and soft skills",
      icon: Activity,
      href: "/skills",
      color: "bg-[var(--color-tertiary-1)]/10 text-[var(--color-tertiary-1)]",
    },
    {
      title: "Profile",
      description: "Manage your professional profile",
      icon: User,
      href: "/profile",
      color: "bg-[var(--color-tertiary-2)]/10 text-[var(--color-tertiary-2)]",
    },
  ]

  return (
    <main className="flex-1 py-4 px-4 lg:py-8 lg:px-10">
      <div className="flex flex-col gap-8">
        {/* Welcome and Profile Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-card border-primary/10">
            <CardHeader>
              <CardTitle>Welcome back, {session?.user?.name ? <span className="text-highlight font-extrabold">{session.user.name}</span> : "Candidate"} 👋</CardTitle>
              <CardDescription>
                This dashboard is crafted just for you. Track your journey, discover new opportunities, and get personalized recommendations to land your dream job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="font-medium">Profile Completion</h3>
                    <p className="text-sm text-muted-foreground">Complete your profile to attract more recruiters</p>
                  </div>
                  <span className="text-lg font-bold text-highlight">{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
                {profileCompletion < 100 && (
                  <div className="bg-secondary/10 p-3 rounded-lg mt-4 border border-secondary/20">
                    <p className="text-sm font-medium">
                      <span className="text-secondary">Tip:</span> Add your work experience to improve your profile.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}> {/* Link to /profile */}
                <User className="mr-2 h-4 w-4" />
                Complete Your Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Jobs Preview Card */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Handpicked Jobs for You</CardTitle>
              <CardDescription>Opportunities that match your interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobs.length === 0 && <div className="text-muted-foreground text-sm">No jobs found.</div>}
                {jobs.map((job) => (
                  <div key={job.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b last:border-b-0 py-2">
                    <div>
                      <div className="font-semibold text-highlight">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.Recruiter?.companyName || 'Company'} &middot; {job.location || (job.remote ? 'Remote' : 'Location not specified')}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 md:mt-0">{job.salary ? job.salary : 'Salary N/A'}</div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full" onClick={() => router.push("/jobs")}>Show More</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col items-center text-center">
                <stat.icon className={`h-6 w-6 ${stat.color} mb-2`} />
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mock Interview Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-primary/30 to-card shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-6 w-6" /> Take a Mock Interview
              </CardTitle>
              <CardDescription>Simulate a real interview experience and get instant feedback tailored to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm">Choose your domain, difficulty, and get started with a professional or AI-powered mock interview. This is your safe space to practice and grow.</p>
              <Button onClick={() => router.push("/mock-interview")} className="text-white bg-primary">Start Mock Interview</Button>
            </CardContent>
          </Card>

          {/* DSA Questions Preview */}
          <Card className="border border-tertiary/20 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Quick DSA Practice</CardTitle>
              <CardDescription className="text-xs">Boost your coding confidence with these picks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {dsaQuestions.length === 0 && <div className="text-muted-foreground text-sm">No DSA questions found.</div>}
                {dsaQuestions.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between border-b-1 px-3 py-1 hover:shadow-sm transition">
                    {problem.id}<span className="font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap max-w-[60%]">{problem.title}</span>
                    <div className="flex flex-wrap gap-1 ml-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium border ${problem.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-tertiary' : problem.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{problem.difficulty}</span>
                        {(problem.category as string[])?.map((cat: string, i: number) => (
                        <Badge key={i} className="text-xs bg-tertiary/10 text-tertiary border border-tertiary/20 px-1 py-[0.25]">{cat}</Badge>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full text-xs p-0 h-7" onClick={() => router.push("/dsa")}>Show More</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recommender Section */}
        <Card className="bg-gradient-to-br from-primary/10 to-card border-primary/10">
          <CardHeader>
            <CardTitle>Your Personalized Study Plan</CardTitle>
            <CardDescription>Recommendations based on your dream companies</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {recommender.length === 0 && <li className="text-muted-foreground text-sm">Select your dream companies to get recommendations.</li>}
              {recommender.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
            <Button className="mt-6" onClick={() => router.push('/roadmaps')}>
              View Roadmap
            </Button>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Tools & Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <Link href={card.href} key={i} className="group">
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      {card.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {card.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-1">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto group-hover:bg-primary/10 group-hover:text-highlight"
                    >
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}


