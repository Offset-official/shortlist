"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserRound, Building2, ArrowRight, LockKeyhole } from "lucide-react"
import Loading from "@/components/ui/loading"

// Client component that uses useSearchParams
const LoginClient = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // Get the tab from URL or default to "candidate"
  const defaultTab = searchParams.get("tab") || "candidate"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // If the user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", activeTab)
    router.push(`/login?${params.toString()}`, { scroll: false })
  }, [activeTab, router, searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        type: activeTab, // Pass the active tab as the user type
      })

      if (result?.error) {
        alert(result.error)
        return
      }

      // If success, redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Optionally, you can show a loading state while session is loading
  if (status === "loading") {
    return (
      <Loading />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-tertiary/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="w-full p-8 shadow-lg border border-border/30 backdrop-blur-sm bg-card/95 rounded-xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8 p-1 bg-muted/50">
              <TabsTrigger
                value="candidate"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                <UserRound className="h-4 w-4" />
                <span>Candidate</span>
              </TabsTrigger>
              <TabsTrigger
                value="recruiter"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                <Building2 className="h-4 w-4" />
                <span>Recruiter</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="candidate" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="candidate-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="candidate-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 bg-background/50 border-input/50 focus:border-primary transition-colors"
                      required
                    />
                    <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="candidate-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="candidate-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 bg-background/50 border-input/50 focus:border-primary transition-colors"
                      required
                    />
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 mt-2 group" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-foreground">
                      <span>Sign in as Candidate</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="recruiter" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="recruiter-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="recruiter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 bg-background/50 border-input/50 focus:border-primary transition-colors"
                      required
                    />
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="recruiter-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="recruiter-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 bg-background/50 border-input/50 focus:border-primary transition-colors"
                      required
                    />
                    <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 mt-2 group text-foreground" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign in as Recruiter</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{" "}
              <a href={`/onboarding/?type=${activeTab}`} className="text-primary font-medium hover:underline">
                Create an account
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
const LoginPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <LoginClient />
    </Suspense>
  )
}

export default LoginPage