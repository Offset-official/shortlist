"use client";
import { useState,useEffect } from 'react';
import JobCard from '@/components/JobCard';
import { useSession } from 'next-auth/react';
import { toast } from "react-hot-toast";

const JobListings = ()=>{

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/getJobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data.jobs);
        toast.success("Jobs action successful!");
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        toast.error("Jobs action failed.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className=" mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} appliedByMe={!!(session && session.user.type === 'candidate' && job.candidates && job.candidates.some((c:any) => c.id === session.user.id))} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <h3 className="text-xl font-medium mb-2">No job listings available</h3>
            <p className="text-gray-500">Check back later for new opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobListings;