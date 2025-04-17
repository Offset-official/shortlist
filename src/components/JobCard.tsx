import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

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
    expiryDate?: Date | null;
    Recruiter: {
      id: number;
      companyName: string;
      logo?: string | null;
    } | null;
  };
};

export default function JobCard({ job, appliedByMe }: JobCardProps & { appliedByMe?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(!!appliedByMe);
  const [error, setError] = useState("");

  useEffect(() => {
    setApplied(!!appliedByMe);
  }, [appliedByMe]);

  const handleApply = async () => {
    if (!session || session.user.type !== 'candidate') {
      router.push('/login');
      return;
    }
    setApplying(true);
    setError("");
    try {
      const res = await fetch('/api/apply_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Failed to apply');
      } else {
        setApplied(true);
      }
    } catch (err) {
      setError('Failed to apply');
    }
    setApplying(false);
  };

  return (
    <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-1 line-clamp-2">{job.title}</h3>
            <p className="text-lg font-semibold text-foreground mb-1">{job.Recruiter?.companyName || 'Company'}</p>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {job.location || (job.remote ? 'Remote' : 'Location not specified')}
                {job.location && job.remote && ' (Remote available)'}
              </span>
              {job.salary && <span className="inline-flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{job.salary}</span>}
            </div>
          </div>
          {job.Recruiter?.logo ? (
            <img src={job.Recruiter.logo} alt={job.Recruiter.companyName} className="w-12 h-12 object-contain rounded-full border border-border" />
          ) : (
            <div className="w-12 h-12 bg-primary border-border rounded-full flex items-center justify-center text-xl font-bold text-background">
              {job.Recruiter?.companyName.charAt(0) || 'C'}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="bg-foreground text-primary border-border text-xs px-2 py-1">{job.employmentType}</Badge>
          {job.experienceLevel && <Badge variant="outline" className="bg-background text-secondary border-border text-xs px-2 py-1">{job.experienceLevel}</Badge>}
        </div>
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Skills</h4>
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">{skill}</Badge>
            ))}
            {job.skills.length > 4 && <Badge variant="secondary" className="text-xs px-2 py-0.5">+{job.skills.length - 4} more</Badge>}
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 mt-2">
          <button
            className={`w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg shadow hover:bg-primary/90 transition ${applied ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={handleApply}
            disabled={applying || applied}
          >
            {applied ? 'Applied' : applying ? 'Applying...' : 'Apply Now'}
          </button>
          {error && <div className="text-destructive text-xs mt-1 text-center">{error}</div>}
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground bg-background px-6 py-3 border-t border-border">
        <span>Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}</span>
        <span>{job.expiryDate ? <>Expires {formatDistanceToNow(new Date(job.expiryDate), { addSuffix: true })}</> : <span>No expiry</span>}</span>
        <span>{job.applicationCount} {job.applicationCount === 1 ? 'applicant' : 'applicants'}</span>
      </div>
    </div>
  );
}