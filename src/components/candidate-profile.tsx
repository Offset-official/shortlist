'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/ui/loading';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResumeUploader } from '@/components/resume-uploader';
import { toast } from "react-hot-toast";
import { FileText } from 'lucide-react';
import { Candidate } from '@/interfaces/model_interfaces';


const CandidateProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }

    if (session?.user?.id) {
      const fetchCandidate = async () => {
        try {
          const response = await axios.get('/api/getCandidate', {
            params: {
              user_id: session.user.id
            }
          });
          setCandidate(response.data);
        } catch (error) {
          console.error('Failed to fetch candidate', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCandidate();
    }

    // Fetch all jobs for application tracker
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/getJobs');
        if (!response.ok) {
          toast.error('Failed to fetch jobs');
          return;
        }
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        toast.error('An error occurred while fetching jobs');
      }
    };
    fetchJobs();
  }, [status]);

  // Helper to get job details by ID
  const getJobById = (id: number | undefined | null) => jobs.find(j => j.id === id);

  if (status === 'loading' || loading || !session) {
    return <Loading />;
  }

  if (!candidate) {
    return <p>Candidate data not found.</p>;
  }

  // Try to get profile image from session or fallback to initial
  const profileImg = session?.user?.image;
  const profileInitial = candidate.name?.[0]?.toUpperCase() || 'C';

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-2 py-2 md:py-4">
      <div className="w-full max-w-7xl mx-auto relative">
        <div className="relative z-10">
          <div className="bg-card/95 border border-border shadow-xl rounded-2xl p-6 md:p-10 flex flex-col gap-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="w-24 h-24 rounded-full border-4 border-primary bg-muted flex items-center justify-center overflow-hidden">
                  {profileImg ? (
                    <img src={profileImg} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{profileInitial}</span>
                  )}
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-0">{candidate.name}</h1>
                  <span className="text-xs text-muted-foreground">{candidate.email}</span>
                  <span className="text-xs text-muted-foreground">{candidate.collegeName}</span>
                  {candidate.location && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                      {candidate.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-2/3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-lg">Profile Completion</h3>
                    <p className="text-sm text-muted-foreground">Complete your profile to attract more recruiters</p>
                  </div>
                  <span className="text-lg font-bold text-primary">85%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            {/* Skills & Dream Companies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="bg-primary text-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">Dream Companies</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.dreamCompanies.map((company, index) => (
                    <span key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
              {/* Resume Analysis Section */}
              <div className="flex flex-col gap-3">
                {candidate.resumeAnalysis ? (
                  <>
                    {/* Resume Analysis Stats (Key Metrics) */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-tertiary" /> Resume Analysis
                      </h3>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Overall Score */}
                        <div className="flex flex-col items-center  gap-1">
                          <span className="text-4xl font-extrabold text-primary">{candidate.resumeAnalysis.overallScore}</span>
                          <span className="text-xs text-muted-foreground">Overall Score</span>
                        </div>
                        {/* Section Scores */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(candidate.resumeAnalysis.sections).map(([section, value]) => {
                              const data = value as { score: number };
                              return (
                                <div key={section} className="flex flex-col items-center bg-muted/50 rounded p-2">
                                  <span className="font-bold text-lg text-tertiary">{data.score}</span>
                                  <span className="text-xs text-muted-foreground capitalize">{section.replace(/([A-Z])/g, ' $1')}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {/* Recommendations */}

                      </div>
                      <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <Button size="sm" variant="outline" onClick={() => router.push('/resume-analysis')}>View Detailed Analysis</Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground text-xs">No resume analysis found.</span>
                    <Button size="sm" variant="outline" onClick={() => router.push('/resume')}>Get Resume Analyzed</Button>
                  </div>
                )}
                <span className="text-xs text-muted-foreground font-medium">Improve your resume to increase your chances of getting shortlisted for jobs.</span>
              </div>
            </div>

            {/* Application Tracker Section */}
            {(candidate.jobListingId || candidate.shortlistedJobListingId) && (
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground mb-2">Application Tracker</h2>
                {candidate.jobListingId && (
                  <div className="mb-4 p-4 border rounded bg-muted/10">
                    <h3 className="font-medium mb-1">Applied Job</h3>
                    {getJobById(candidate.jobListingId) ? (
                      <>
                        <div className="text-base font-semibold">{getJobById(candidate.jobListingId)?.title}</div>
                        <div className="text-xs text-muted-foreground mb-1">{getJobById(candidate.jobListingId)?.Recruiter?.companyName}</div>
                        <div className="flex flex-wrap gap-2 mb-1">
                          {getJobById(candidate.jobListingId)?.skills?.slice(0, 4).map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">{getJobById(candidate.jobListingId)?.location} • {getJobById(candidate.jobListingId)?.employmentType}</div>
                      </>
                    ) : (
                      <span>Applied for Job ID: {candidate.jobListingId}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Resume Dialog */}
            <Dialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Resume</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {candidate.resume ? (
                    <div className="text-sm">
                      {/* Render resume in a pretty way, fallback to JSON if needed */}
                      {candidate.resume.personalInfo && (
                        <div className="mb-2">
                          <div className="font-semibold">{candidate.resume.personalInfo.name}</div>
                          <div className="text-xs text-muted-foreground">{candidate.resume.personalInfo.email}</div>
                          <div className="text-xs text-muted-foreground">{candidate.resume.personalInfo.location}</div>
                        </div>
                      )}
                      {candidate.resume.summary && (
                        <div className="mb-2">
                          <div className="font-semibold">Summary</div>
                          <div className="text-xs">{candidate.resume.summary}</div>
                        </div>
                      )}
                      {candidate.resume.education && candidate.resume.education.length > 0 && (
                        <div className="mb-2">
                          <div className="font-semibold">Education</div>
                          <ul className="list-disc ml-5 text-xs">
                            {candidate.resume.education.map((edu: any, idx: number) => (
                              <li key={idx}>
                                {edu.degree} at {edu.institution} ({edu.dates})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {candidate.resume.experience && candidate.resume.experience.length > 0 && (
                        <div className="mb-2">
                          <div className="font-semibold">Experience</div>
                          <ul className="list-disc ml-5 text-xs">
                            {candidate.resume.experience.map((exp: any, idx: number) => (
                              <li key={idx}>
                                {exp.title} at {exp.company} ({exp.dates})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {candidate.resume.skills && (
                        <div className="mb-2">
                          <div className="font-semibold">Skills</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {(candidate.resume.skills.technical || []).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                            {(candidate.resume.skills.soft || []).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Fallback: show JSON if nothing else */}
                      {!(candidate.resume.personalInfo || candidate.resume.summary || candidate.resume.education || candidate.resume.experience || candidate.resume.skills) && (
                        <pre className="whitespace-pre-wrap text-xs bg-muted/20 p-2 rounded">
                          {JSON.stringify(candidate.resume, null, 2)}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div>No resume data available.</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Overwrite Resume Section */}
            <div className="px-6 pb-8">
              <ResumeUploader userId={candidate.id.toString()} />
            </div>

            <div className="px-6 py-4 bg-card border-t border-border rounded-b-2xl">
              <p className="text-sm text-foreground">
                Candidate registered on {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        {/* Decorative blurred backgrounds for modern look */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/10 blur-3xl" />
        </div>
      </div>
    </main>
  );
}

export default CandidateProfile;