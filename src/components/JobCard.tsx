import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
type JobCardProps = {
  job: {
    id: number;
    title: string;
    location: string | null;
    remote: boolean;
    salary: string | null;
    employmentType: string;
    experienceLevel: string | null;
    skills: string[];
    postedDate: Date;
    applicationCount: number;
    Recruiter: {
      id: number;
      companyName: string;
      logo?: string | null;
    } | null;
  };
};

export default function JobCard({ job }: JobCardProps) {
  return (
    
      <div className="bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-border">
        <div className="p-6">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-xl font-semibold text-foreground line-clamp-2">{job.title}</h3>
            {job.Recruiter?.logo ? (
              <img 
                src={job.Recruiter.logo} 
                alt={job.Recruiter.companyName} 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-primary border-border rounded-full flex items-center justify-center">
                <span className="text-foreground font-semibold">
                  {job.Recruiter?.companyName.charAt(0) || 'C'}
                </span>
              </div>
            )}
          </div>
          
          <p className="text-foreground font-bold mb-2">{job.Recruiter?.companyName || 'Company'}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center text-sm text-foreground">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {job.location || (job.remote ? 'Remote' : 'Location not specified')}
              {job.location && job.remote && ' (Remote available)'}
            </span>
            
            {job.salary && (
              <span className="inline-flex items-center text-sm text-foreground">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {job.salary}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            <Badge variant="outline" className="bg-foreground text-primary border-border">
              {job.employmentType}
            </Badge>
            
            {job.experienceLevel && (
              <Badge variant="outline" className="bg-background text-secondary border-border">
                {job.experienceLevel}
              </Badge>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-1">Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          <div className='flex justify-end'>
          <Link className='text-foreground w-full bg-primary p-2 rounded-md text-center' href={`/jobs/${job.id}`}>Apply Now</Link>
          </div>
          <div className="flex justify-between items-center text-sm text-foreground mt-3 pt-3 border-t border-border">
            <span>
              Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
            </span>
            <span>
              {job.applicationCount} {job.applicationCount === 1 ? 'applicant' : 'applicants'}
            </span>
          </div>
        </div>
      </div>
  );
}