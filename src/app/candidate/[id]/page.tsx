import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation'
import ResumeButton from '@/components/ResumeButton'; // Adjust the import path as necessary
type Candidate = {
  id: number
  name: string
  email: string
  year?: number | null
  collegeName?: string | null
  location?: string | null
  resume?: any
  dreamCompanies: string[]
  skills: string[]
  createdAt: Date
  jobListingId?: number | null
  shortlistedJobListingId?: number | null
}


async function getCandidateData(id: number): Promise<Candidate | null> {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id }
    })
    await prisma.$disconnect()
    return candidate as Candidate | null
  } catch (error) {
    console.error("Error fetching candidate:", error)
    throw new Error("Failed to fetch candidate data")
  }
}

export default async function CandidateDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = Number(resolvedParams.id)
  
  if (isNaN(id)) {
    notFound()
  }
  
  const candidate = await getCandidateData(id)
  
  if (!candidate) {
    notFound()
  }

  function openResumeChat() {
    // save resume in session storage as system instruction
    if (candidate && candidate.resume) {
      sessionStorage.setItem("LLMsystemInstruction", JSON.stringify(candidate.resume));
      console.log("System instruction set in session storage:", candidate.resume);
    }
    // navigate to chat
    redirect("/chat");
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">


        <div className="bg-card shadow rounded-lg overflow-hidden">
          {/* Header with basic info */}
          <div className="px-6 py-8 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{candidate.name}</h1>
                <p className="mt-1 text-lg text-foreground">
                  {candidate.year && `Class of ${candidate.year}`} 
                  {candidate.collegeName && candidate.year && ` • `}
                  {candidate.collegeName}
                </p>
                {candidate.location && (
                  <p className="mt-2 text-foreground flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    {candidate.location}
                  </p>
                )}
              </div>
              {candidate && candidate.resume && <ResumeButton resume={candidate.resume} />}
            </div>
          </div>

          {/* Main content */}
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div>
              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="bg-primary text-foreground px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dream Companies */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Dream Companies</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.dreamCompanies.map((company, index) => (
                    <span key={index} className="bg-secondary text-foreground px-3 py-1 rounded-full text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Application Status */}
              {(candidate.jobListingId || candidate.shortlistedJobListingId) && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Application Status</h2>
                  {candidate.jobListingId && (
                    <div className="flex items-center mb-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span>Applied to Job ID: {candidate.jobListingId}</span>
                    </div>
                  )}
                  {candidate.shortlistedJobListingId && (
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-background rounded-full mr-2"></span>
                      <span className="font-medium text-foreground">Shortlisted for Job ID: {candidate.shortlistedJobListingId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resume Preview */}
              {candidate.resume && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Resume</h2>
                  <div className="bg-background p-4 border border-border rounded">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(candidate.resume, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-card border-t border-border">
            <p className="text-sm text-foreground">
              Candidate registered on {new Date(candidate.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}