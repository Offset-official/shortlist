"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
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

  const recentActivity = [
    { action: "Applied to", target: "Senior Frontend Developer at TechCorp", time: "2 hours ago" },
    { action: "Completed", target: "React Assessment Test", time: "Yesterday" },
    { action: "Saved", target: "Full Stack Engineer at StartupX", time: "2 days ago" },
  ]

  return (


      <main className="flex-1 container py-8 px-10">
        <div className="flex flex-col gap-8">
          {/* Welcome and Profile Section */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Welcome back, {session?.user?.name || "Candidate"}</CardTitle>
                <CardDescription>Here's what's happening with your job search today.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Profile Completion</h3>
                      <p className="text-sm text-muted-foreground">Complete your profile to attract more recruiters</p>
                    </div>
                    <span className="text-lg font-bold">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />

                  {profileCompletion < 100 && (
                    <div className="bg-secondary/5 p-3 rounded-lg mt-4 border border-secondary/20">
                      <p className="text-sm font-medium">
                        <span className="text-secondary">Tip:</span> Add your work experience to improve your profile.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Complete Your Profile
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions on Shortlist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-2 pb-3 border-b last:border-0 last:pb-0">
                      <div className="h-2 w-2 mt-2 rounded-full bg-secondary" />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.action}</span> {activity.target}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <stat.icon className={`h-8 w-8 ${stat.color} mb-2`} />
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Cards */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Features & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        className="ml-auto group-hover:bg-primary/10 group-hover:text-primary"
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


