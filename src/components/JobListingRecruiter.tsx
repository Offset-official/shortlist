// components/JobListingRecruiter.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Props for the JobListingRecruiter component
 */
type Job = {
  id: number;
  title: string;
  location: string;
  employmentType: string;
  status?: string;
  postedDate: string;
};

interface JobListingRecruiterProps {
  job: Job;
}

/**
 * Renders a single job card for the recruiter dashboard,
 * displaying job details and a button to view the listing.
 */
export default function JobListingRecruiter({ job }: JobListingRecruiterProps) {
  return (
    <div className="border rounded-lg p-6 bg-card shadow">
      <div className="flex justify-between items-center mb-4">
        {/* Job title and metadata */}
        <div>
          <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
          <p className="text-sm text-muted-foreground">
            {job.location} • {job.employmentType} • {job.status}
          </p>
        </div>
        {/* Posted date */}
        <p className="text-xs text-muted-foreground">
          {new Date(job.postedDate).toLocaleDateString()}
        </p>
      </div>
      {/* View Job button linking to job details */}
      <Link href={`/jobListing/${job.id}`}>  
        <Button variant="outline">View Job</Button>
      </Link>
    </div>
  );
}
