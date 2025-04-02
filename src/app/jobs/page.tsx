// app/jobs/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import JobCard from '@/components/JobCard';


export default async function JobListings() {
  const jobs = await prisma.jobListing.findMany({
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