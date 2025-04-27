import Image from "next/image"
import { Users, Briefcase, CheckCircle, Clock, TrendingUp, Search, Building, UserCheck } from "lucide-react"
import LinkButton from "@/components/link-button"
import GrainyHero from "@/components/GrainyHero"
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <GrainyHero>
        <section className="py-10 w-full min-h-screen flex justify-center">
          <div className=" max-w-7xl mx-auto px-4 md:px-6 grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Connecting the right talent with the right opportunities
              </h1>
              <p className="text-xl text-muted-foreground">
                Shortlist streamlines recruitment, making it easier for candidates to find their dream jobs and for
                recruiters to find perfect matches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <LinkButton
                  text="For Recruiters"
                  href="/onboarding?type=recruiter"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/70 hover:border-secondary"
                >
                  <Building className="mr-2 h-5 w-5" />
                </LinkButton>
                <LinkButton
                  text="For Candidates"
                  href="/onboarding?type=candidate"
                  className="bg-primary text-primary-foreground hover:bg-primary/70 hover:border-primary"
                >
                  <Users className="mr-2 h-5 w-5" />
                </LinkButton>
              </div>
            </div>
          </div>
        </section>
      </GrainyHero>
      <main className="flex-1 flex flex-col items-center justify-center w-full bg-background mt-10">
        {/* product Section */}
        <section className="flex flex-col items-center justify-center w-[80vw] p-10 m-10 mx-auto">
          <div className="flex items-center justify-center w-full mb-8 relative">
            {/* Glow effect behind images */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 via-yellow/20 to-primary/20 blur-3xl rounded-full opacity-70"></div>

            <div className="relative w-40 h-60 md:w-[25vw] md:h-80 z-30 -right-40 top-6 -rotate-12">
              <Image
                alt="Shortlist AI Interview Mockup 1"
                src="/assets/mock1.png"
                fill
                className="object-contain rounded-lg shadow-lg"
                style={{ zIndex: 3 }}
              />
            </div>
            <div className="relative -ml-8 w-80 h-60 md:w-[50vw] md:h-80 z-50">
              <Image
                alt="Shortlist AI Interview Mockup 2"
                src="/assets/mock2.png"
                fill
                className="object-contain rounded-lg shadow-lg"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="relative w-40 h-60 md:w-[25vw] md:h-72 z-10 right-50 rotate-12">
              <Image
                alt="Shortlist AI Interview Mockup 3"
                src="/assets/mock3.png"
                fill
                className="object-contain rounded-lg shadow-lg"
                style={{ zIndex: 1 }}
              />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-thin mb-6 text-center w-full">
            Experience <span className="font-bold">Next-Gen AI-Powered</span> Interviews
          </h2>
          <ul className="space-y-4 text-lg max-w-2xl w-full px-2 font-extralight text-foreground">
            <li className="flex items-start gap-2">
              •
              <span>
                <span className="font-medium">Most secure online assessment</span> powered by{" "}
                <span className="font-semibold">Screenpipe</span>, <span className="font-semibold">terminator</span>,
                and <span className="font-semibold">MediaPipe.</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>
                <span className="font-medium">Adaptive mock interviews</span> with instant feedback and in-depth
                analysis using <span className="font-semibold">Fluvio</span> and{" "}
                <span className="font-semibold">Groq</span>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              •
              <span>
                <span className="font-medium">End-to-end solution</span> with integrated{" "}
                <span className="font-semibold">notifications</span> for seamless recruitment.
              </span>
            </li>
            <li className="flex items-start gap-2">
              •
              <span>
                <span className="font-medium">Highly customizable</span> and easy to use for both{" "}
                <span className="font-semibold">candidates</span> and <span className="font-semibold">recruiters</span>.
              </span>
                    </li>
                    <li className="flex items-start gap-2">
                      •
                      <span>
                      <span className="font-medium">Progressive Web App (PWA)</span>: Practice and assess seamlessly on any
                      device—mobile, laptop, or tablet—anywhere, anytime.
                      </span>
                    </li>
                    </ul>
                  </section>

                  {/* For Candidates Section */}
                  <section className="py-10 bg-primary/10 w-full flex justify-center">
          <div className=" max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 relative h-[550px]">
                <Image
                  src="/assets/laptop_happy.png?height=400&width=400"
                  alt="Candidate Profile"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="order-1 lg:order-2 space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-2">
                  For Candidates
                </div>
                <h2 className="text-3xl font-bold tracking-tighter">Land your dream job with ease</h2>
                <p className="text-lg text-muted-foreground">
                  Focus on learning the skills that matter for your target roles. No more fear of interviews—practice
                  continuously, improve constantly, and build confidence for every opportunity.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                    <span>Practice with realistic AI-powered mock interviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <span>Receive personalized preparation tips tailored to your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Get in-depth resume analysis for your target roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>And much more!!</span>
                  </li>
                </ul>
                <LinkButton
                  href="/onboarding?type=candidate"
                  text="Create Your Profile"
                  className="bg-primary hover:bg-primary/70 hover:border-primary text-primary-foreground text-sm"
                />
              </div>
            </div>
          </div>
        </section>
                {/* Statistics Section */}
                <section className="py-16 w-full flex justify-center bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Why Shortlist Matters</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                The interview process is broken. Here's why our solution is critical for today's job market:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-primary/10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">78%</h3>
                <p className="text-muted-foreground">
                  of undergraduates fear job interviews, leading to underperformance
                </p>
              </div>

              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-primary/10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">65%</h3>
                <p className="text-muted-foreground">
                  of hiring managers say candidates lack essential communication skills
                </p>
              </div>

              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-primary/10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">3.2×</h3>
                <p className="text-muted-foreground">
                  higher success rate for candidates who practice interviews beforehand
                </p>
              </div>

              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-sm border border-primary/10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-4xl font-bold mb-2">92%</h3>
                <p className="text-muted-foreground">
                  of recruiters prioritize soft skills equally or more than technical skills
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* For Recruiters Section */}
        <section className="py-10 bg-secondary/10 w-full flex justify-center">
          <div className=" max-w-7xl mx-auto px-4 md:px-6">
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
                  <li className="flex items-start gap-2">
                    <span>And much more!!</span>
                  </li>
                </ul>
                <LinkButton
                  href="/onboarding?type=recruiter"
                  text="Start Recruiting"
                  className="bg-secondary hover:bg-secondary/70 hover:border-secondary text-secondary-foreground text-sm"
                />
              </div>
              <div className="relative h-[550px]">
                <Image
                  src="/assets/laptop_human.png"
                  alt="Recruiter Dashboard"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-20 bg-background text-foreground w-full flex justify-center">
          <div className=" max-w-7xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your hiring process?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of recruiters and candidates who are already using Shortlist to connect and grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LinkButton
                text="Join as Recruiter"
                href="/onboarding?type=recruiter"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/70 hover:border-secondary"
              />
              <LinkButton
                text="Join as Candidate"
                href="/onboarding?type=candidate"
                className="bg-primary text-primary-foreground hover:bg-primary/70 hover:border-primary"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
