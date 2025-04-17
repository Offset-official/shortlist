'use client'

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Recruiter = {
  id: number;
  name: string;
  email: string;
  companyName?: string | null;
  industry?: string | null;
  companySize?: string | null;
  location?: string | null;
  website?: string | null;
  linkedInUrl?: string | null;
  values?: string[] | null;
  description?: string | null;
  createdAt: string; // coming as ISO string from JSON
};

const RecruiterProfile = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/login');
    }

    if (session?.user?.id) {
      const fetchRecruiter = async () => {
        try {
          const response = await axios.get('/api/getRecruiter', {
            params: {
              user_id: session.user.id
            }
          });
          setRecruiter(response.data);
        } catch (error) {
          console.error('Failed to fetch Recruiter', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecruiter();
    }
  }, [session, status]);

  if (status === 'loading' || loading || !session) {
    return <p>Loading...</p>;
  }

  if (!recruiter) {
    return <p>Recruiter data not found.</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-card shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{recruiter.companyName || recruiter.name}</h1>
                <p className="mt-1 text-lg text-foreground">
                  {recruiter.industry && <span>{recruiter.industry}</span>}
                  {recruiter.companySize && recruiter.industry && ' • '}
                  {recruiter.companySize}
                </p>
                {recruiter.location && (
                  <p className="mt-2 text-foreground flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    {recruiter.location}
                  </p>
                )}
                {recruiter.website && (
                  <p className="mt-2 text-foreground">
                    <a href={recruiter.website} target="_blank" rel="noopener noreferrer" className="underline text-primary">{recruiter.website}</a>
                  </p>
                )}
                {recruiter.linkedInUrl && (
                  <p className="mt-2 text-foreground">
                    <a href={recruiter.linkedInUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">LinkedIn</a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Company Values</h2>
                <div className="flex flex-wrap gap-2">
                  {(recruiter.values || []).map((value, index) => (
                    <span key={index} className="bg-primary text-foreground px-3 py-1 rounded-full text-sm">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
                <div className="bg-background p-4 border border-border rounded text-foreground text-sm">
                  {recruiter.description || <span className="italic text-muted-foreground">No description provided.</span>}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Contact</h2>
                <div className="flex flex-col gap-2">
                  <span className="text-foreground">Email: {recruiter.email}</span>
                  {recruiter.website && <span className="text-foreground">Website: <a href={recruiter.website} className="underline text-primary" target="_blank" rel="noopener noreferrer">{recruiter.website}</a></span>}
                  {recruiter.linkedInUrl && <span className="text-foreground">LinkedIn: <a href={recruiter.linkedInUrl} className="underline text-primary" target="_blank" rel="noopener noreferrer">{recruiter.linkedInUrl}</a></span>}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Stats</h2>
                <div className="flex flex-col gap-2">
                  <span className="text-foreground">Jobs Posted: <span className="font-bold">-</span></span>
                  <span className="text-foreground">Applicants: <span className="font-bold">-</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-card border-t border-border">
            <p className="text-sm text-foreground">
              Recruiter registered on {new Date(recruiter.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterProfile;