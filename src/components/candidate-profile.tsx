'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ResumeButton from '@/components/ResumeButton';
import Loading from '@/components/ui/loading';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Candidate = {
  id: number;
  name: string;
  email: string;
  year?: number | null;
  collegeName?: string | null;
  location?: string | null;
  resume?: any;
  dreamCompanies: string[];
  skills: string[];
  createdAt: string; // coming as ISO string from JSON
  jobListingId?: number | null;
  shortlistedJobListingId?: number | null;
};

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
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (e) {
        // ignore for now
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-card shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{candidate.name}</h1>
                <p className="mt-1 text-lg text-foreground">
                  {candidate.year && `Class of ${candidate.year}`}
                  {candidate.collegeName && candidate.year && ' • '}
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
              {candidate.resume && (
                <Button variant="outline" onClick={() => setResumeDialogOpen(true)}>
                  View Resume
                </Button>
              )}
            </div>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
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

            <div>
              {/* Application Tracker Section */}
              {(candidate.jobListingId || candidate.shortlistedJobListingId) && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Application Tracker</h2>
                  {candidate.jobListingId && (
                    <div className="mb-4 p-4 border rounded bg-muted/10">
                      <h3 className="font-medium mb-1">Applied Job</h3>
                      {getJobById(candidate.jobListingId) ? (
                        <>
                          <div className="text-lg font-semibold">{getJobById(candidate.jobListingId)?.title}</div>
                          <div className="text-sm text-muted-foreground mb-1">{getJobById(candidate.jobListingId)?.Recruiter?.companyName}</div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            {getJobById(candidate.jobListingId)?.skills?.slice(0, 4).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">{getJobById(candidate.jobListingId)?.location} • {getJobById(candidate.jobListingId)?.employmentType}</div>
                        </>
                      ) : (
                        <span>Applied to Job ID: {candidate.jobListingId}</span>
                      )}
                    </div>
                  )}
                  {candidate.shortlistedJobListingId && (
                    <div className="p-4 border rounded bg-muted/10">
                      <h3 className="font-medium mb-1">Shortlisted Job</h3>
                      {getJobById(candidate.shortlistedJobListingId) ? (
                        <>
                          <div className="text-lg font-semibold">{getJobById(candidate.shortlistedJobListingId)?.title}</div>
                          <div className="text-sm text-muted-foreground mb-1">{getJobById(candidate.shortlistedJobListingId)?.Recruiter?.companyName}</div>
                          <div className="flex flex-wrap gap-2 mb-1">
                            {getJobById(candidate.shortlistedJobListingId)?.skills?.slice(0, 4).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">{getJobById(candidate.shortlistedJobListingId)?.location} • {getJobById(candidate.shortlistedJobListingId)?.employmentType}</div>
                        </>
                      ) : (
                        <span>Shortlisted for Job ID: {candidate.shortlistedJobListingId}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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

          <div className="px-6 py-4 bg-card border-t border-border">
            <p className="text-sm text-foreground">
              Candidate registered on {new Date(candidate.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;