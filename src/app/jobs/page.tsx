"use client";
import { useState,useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import JobCard from '@/components/JobCard';


const JobListings = async ()=>{

  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await prisma.jobListing.findMany({
          where: {
            status: 'active',
            expiryDate: {
              gt: new Date(),
            },
          },
          include: {
            Recruiter: true,
          },
          orderBy: {
            postedDate: 'desc',
          },
        });
        setJobs(data);
      } catch (e) {
        console.error("Failed to fetch jobs:", e);
        setError("Failed to load job listings. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} />
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