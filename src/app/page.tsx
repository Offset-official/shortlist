"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, Briefcase, CheckCircle, Clock, TrendingUp, Search, Building, UserCheck } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import LinkButton from "@/components/link-button"
import { Github, Twitter, Instagram, Mail, Phone } from "lucide-react";
import LandingFooter from "@/components/LandingFooter"
import { toast } from "react-hot-toast"

export default function LandingPage() {
  // Sample data for charts
  const barData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 55 },
    { name: "Mar", value: 60 },
    { name: "Apr", value: 75 },
    { name: "May", value: 85 },
    { name: "Jun", value: 95 },
  ]

  const pieData = [
    { name: "Chut", value: 35 },
    { name: "Finance", value: 25 },
    { name: "Healthcare", value: 20 },
    { name: "Other", value: 20 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const { data: session } = useSession()

  return (
  <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/interview1.png"
              alt="Shortlist Logo"
              width={40}
              height={40}
              className="rounded" />
            <span className="text-xl font-bold">shortlist</span>
          </Link>
          <div className="flex items-center gap-4">
            {!session ? (
              <>
                <LinkButton
                  href="/onboarding?type=recruiter"
                  text="Join as Recruiter"
                  className="border-secondary bg-secondary text-secondary hover:bg-secondary/10 hover:text-secondary" />
                <LinkButton
                  href="/onboarding?type=candidate"
                  text="Join as Candidate"
                  className="border-tertiary bg-tertiary text-tertiary hover:bg-tertiary/10 hover:text-tertiary" />
                <LinkButton href="/login" text="login" />
              </>
            ) : (
              <>
                <div className="flex items-center mr-4">
                  <span className="mr-2">Hi, {session.user?.name}</span>
                  {session.user?.image && (
                    <Image
                      src={session.user.image || "//assets/interview1.png"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full" />
                  )}
                </div>
                <LinkButton href="/dashboard" text="Go to Dashboard" className="" />
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await signOut({ redirect: false })
                    toast.success("Signed out successfully!")
                  } }
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                  Connecting the right talent with the right opportunities
                </h1>
                <p className="text-xl text-muted-foreground">
                  Shortlist streamlines recruitment, making it easier for candidates to find their dream jobs and for
                  recruiters to find perfect matches.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <LinkButton
                    text="For Recruiters"
                    href="/onboarding?type=recruiter"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  >
                    <Building className="mr-2 h-5 w-5" />
                  </LinkButton>
                  <LinkButton
                    text="For Candidates"
                    href="/onboarding?type=candidate"
                    className="bg-tertiary text-foreground hover:bg-tertiary/90"
                  >
                    <Building className="mr-2 h-5 w-5" />
                  </LinkButton>

                </div>
              </div>
              <div className="relative h-[400px] lg:h-[500px]">
                <Image
                  src="/assets/interview1.png"
                  alt="Hero Image"
                  fill
                  className="object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-foreground/5">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Impact in Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Users className="h-10 w-10 text-secondary mb-4" />
                  <h3 className="text-3xl font-bold">10k+</h3>
                  <p className="text-muted-foreground">Active Recruiters</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Briefcase className="h-10 w-10 text-tertiary mb-4" />
                  <h3 className="text-3xl font-bold">50k+</h3>
                  <p className="text-muted-foreground">Job Listings</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <CheckCircle className="h-10 w-10 text-tertiary mb-4" />
                  <h3 className="text-3xl font-bold">25k+</h3>
                <p className="text-muted-foreground">Successful Placements</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Clock className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-3xl font-bold">75%</h3>
                <p className="text-muted-foreground">Faster Hiring</p>
              </CardContent>
            </Card>
          </div>
          </div>
      </section>

      {/* Graphs Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Insights & Trends</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Placement Growth</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar dataKey="value" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Industry Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Recruiters Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-sm text-secondary mb-2">
                For Recruiters
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">Find the perfect candidates faster</h2>
              <p className="text-lg text-muted-foreground">
                Our AI-powered matching algorithm helps you identify the most qualified candidates for your open
                positions, saving you time and resources.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Search className="h-5 w-5 text-secondary mt-0.5" />
                  <span>Advanced search filters to find candidates with specific skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary mt-0.5" />
                  <span>Analytics dashboard to track your recruitment performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-secondary mt-0.5" />
                  <span>Automated screening to reduce time-to-hire</span>
                </li>
              </ul>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 mt-2">
                Start Recruiting
              </Button>
            </div>
            <div className="relative h-[400px]">
              <Image
                src="/assets/interview1.png"
                alt="Recruiter Dashboard"
                fill
                className="object-cover rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* For Candidates Section */}
      <section className="py-16 bg-tertiary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 relative h-[400px]">
              <Image
                src="/assets/interview1.png?height=400&width=500"
                alt="Candidate Profile"
                fill
                className="object-cover rounded-lg" />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-block rounded-lg bg-tertiary/10 px-3 py-1 text-sm text-tertiary mb-2">
                For Candidates
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">Land your dream job with ease</h2>
              <p className="text-lg text-muted-foreground">
                Create a standout profile that showcases your skills and experience, and get matched with
                opportunities that align with your career goals.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-tertiary mt-0.5" />
                  <span>Personalized job recommendations based on your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-tertiary mt-0.5" />
                  <span>Skills assessment to highlight your strengths</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-tertiary mt-0.5" />
                  <span>Direct communication with recruiters</span>
                </li>
              </ul>
              <Button className="bg-tertiary text-foreground hover:bg-tertiary/90 mt-2">
                Create Your Profile
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card text-card-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring process?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of recruiters and candidates who are already using Shortlist to connect and grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton
              text="Join as Recruiter"
              href="/onboarding?type=recruiter"
              className="bg-secondary text-/assets/interview1.png hover:bg-secondary/90" />
            <LinkButton
              text="Join as Candidate"
              href="/onboarding?type=candidate"
              className="bg-tertiary text-foreground hover:bg-tertiary/90" />
          </div>
        </div>
      </section>
    </main>
    <LandingFooter />
    </div>
  )
}
