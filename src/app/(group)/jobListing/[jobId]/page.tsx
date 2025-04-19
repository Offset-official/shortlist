'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';  // Use useParams from next/navigation
import Loading from '@/components/ui/loading';
import CandidateDetailsPopup from '@/components/CandidateDetailsPopup';
import { Button } from '@/components/ui/button';

/**
 * Candidate interface matching API response
 */
interface Candidate {
  id: number;
  name: string;
  email: string;
  resume?: any;
  createdAt: string; // ISO date string
  dreamCompanies: string[];
  skills: string[];
}

// Number of candidates per page
const PAGE_SIZE = 10;

/**
 * Job listing page showing paginated candidates for a specific job.
 * Route: /recruiter/jobs/[jobId]
 */
export default function JobListingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { jobId } = useParams();  // Correct method to fetch the jobId

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }
  }, [status]);

  // Fetch candidates when jobId or page changes
  useEffect(() => {
    if (!jobId) {
      setError('Job ID is missing');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`/api/getJobCandidates?jobId=${jobId}&page=${page}&limit=${PAGE_SIZE}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch job candidates: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.candidates) {
          setCandidates(data.candidates);
        } else {
          setError('No candidates found for this job.');
        }
      })
      .catch(error => {
        console.error('Error fetching job candidates:', error);
        setError('An error occurred while fetching candidates.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [jobId, page]);

  // Show loading spinner or error message
  if (status === 'loading' || loading) {
    return <Loading />;
  }
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">Job Candidates</h1>

      {/* Show error message if any */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Candidate list */}
      {candidates.length === 0 ? (
        <p className="text-muted-foreground">No candidates found.</p>
      ) : (
        <ul className="space-y-4">
          {candidates.map(c => (
            <li
              key={c.id}
              className="flex justify-between items-center border rounded p-4 bg-card"
            >
              <div>
                <p className="font-semibold text-foreground">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  Applied: {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => setSelectedCandidate(c)}>
                View Details
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination controls */}
      <div className="flex justify-between mt-6">
        <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
          Previous
        </Button>
        <Button onClick={() => setPage(p => p + 1)} disabled={candidates.length < PAGE_SIZE}>
          Next
        </Button>
      </div>

      {/* Candidate details popup */}
      {selectedCandidate && (
        <CandidateDetailsPopup
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
