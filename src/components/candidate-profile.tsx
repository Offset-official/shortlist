'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ResumeButton from '@/components/ResumeButton';

type Candidate = {
  id: number;
  name: string;
  email: string;
  year?: number | null;
  collegeName?: string | null;
  location?: string | null;
  resume?: any;
  resumeAnalysis?: any;   // <-- treat as any, will stringify
  dreamCompanies: string[];
  skills: string[];
  createdAt: string;
  jobListingId?: number | null;
  shortlistedJobListingId?: number | null;
};

const CandidateProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }

    if (session?.user?.id) {
      const fetchCandidate = async () => {
        try {
          const response = await axios.get('/api/getCandidate', {
            params: { user_id: session.user.id }
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
  }, [status]);

  if (status === 'loading' || loading || !session) {
    return <p>Loading...</p>;
  }

  if (!candidate) {
    return <p>Candidate data not found.</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-card shadow rounded-lg overflow-hidden">
          {/* Header */}
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
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {candidate.location}
                  </p>
                )}
              </div>
              {candidate.resume && <ResumeButton resume={candidate.resume} />}
            </div>
          </div>

          {/* Main Grid */}
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Skills, Dream Companies, Resume Analysis */}
            <div>
              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-primary text-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dream Companies */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Dream Companies
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.dreamCompanies.map((company, idx) => (
                    <span
                      key={idx}
                      className="bg-secondary text-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Analysis (raw JSON) */}
              {candidate.resumeAnalysis && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Resume Analysis
                  </h2>
                  <div className="bg-background p-4 border border-border rounded">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(candidate.resumeAnalysis, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Application Status & Raw Resume JSON */}
            <div>
              {(candidate.jobListingId || candidate.shortlistedJobListingId) && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Application Status
                  </h2>
                  {candidate.jobListingId && (
                    <div className="flex items-center mb-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span>Applied to Job ID: {candidate.jobListingId}</span>
                    </div>
                  )}
                  {candidate.shortlistedJobListingId && (
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-background rounded-full mr-2"></span>
                      <span className="font-medium text-foreground">
                        Shortlisted for Job ID: {candidate.shortlistedJobListingId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {candidate.resume && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Resume
                  </h2>
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
              Candidate registered on{' '}
              {new Date(candidate.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
