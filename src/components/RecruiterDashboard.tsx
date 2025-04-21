// components/RecruiterDashboard.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import JobListingRecruiter from '@/components/JobListingRecruiter';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading';
import { toast } from "react-hot-toast";

/**
 * Type definitions for Job and Candidate
 */

type Job = {
  id: number;
  title: string;
  location: string;
  employmentType: string;
  status?: string;
  postedDate: string;
};

/**
 * Inline tag-input component for skills
 */
interface SkillTagInputProps {
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
}
function SkillTagInput({ skills, setSkills }: SkillTagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!skills.includes(input.trim())) setSkills([...skills, input.trim()]);
      setInput('');
    } else if (e.key === 'Backspace' && !input && skills.length) {
      setSkills(skills.slice(0, -1));
    }
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border rounded p-2 bg-background">
      {skills.map((skill, idx) => (
        <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
          {skill}
          <button type="button" onClick={() => removeSkill(idx)} className="ml-1 text-xs text-destructive">×</button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] bg-transparent outline-none"
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={skills.length === 0 ? 'e.g. React, Node.js, SQL' : 'Add skill...'}
      />
    </div>
  );
}

/**
 * Recruiter dashboard showing stats, add-job modal, and job listings
 */
export default function RecruiterDashboard(): ReactNode {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState(false);
  const [salary, setSalary] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setJobsLoading(true);
    fetch('/api/getRecruiterJobs')
      .then(res => res.json())
      .then(data => setJobs(data.jobs || []))
      .finally(() => setJobsLoading(false));
  }, [status]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/add_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          location,
          remote,
          salary,
          description: jobDesc,
          employmentType,
          experienceLevel,
          jobRole,
          skills,
          education,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error || 'Failed to add job');
        setSubmitting(false);
        return;
      }
      toast.success('Job added successfully!');
      const resJobs = await fetch('/api/getRecruiterJobs');
      const data = await resJobs.json();
      setJobs(data.jobs || []);
      setSubmitting(false);
      setOpen(false);
      setJobTitle(''); setJobDesc(''); setLocation(''); setRemote(false);
      setSalary(''); setEmploymentType(''); setExperienceLevel(''); setJobRole('');
      setSkills([]); setEducation(''); setExpiryDate('');
    } catch (err) {
      toast.error('An error occurred while adding the job.');
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <Loading />;

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-5xl font-bold mb-4">ShortList</h1>
      <p className="mb-8 text-xl text-secondary font-bold">Recruiter Dashboard</p>
      <div className="mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Job</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add New Job</DialogTitle></DialogHeader>
            <form onSubmit={handleAddJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <input required placeholder="Title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="border p-2 rounded" />
                <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="border p-2 rounded" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} /> Remote
                </label>
                <input placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} className="border p-2 rounded" />
                <input required placeholder="Type" value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="border p-2 rounded" />
                <input placeholder="Experience" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="border p-2 rounded" />
                <input placeholder="Role" value={jobRole} onChange={e => setJobRole(e.target.value)} className="border p-2 rounded" />
              </div>
              <div className="flex flex-col gap-4">
                <textarea required placeholder="Description" value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="border p-2 rounded h-32" />
                <div>
                  <label>Skills</label>
                  <SkillTagInput skills={skills} setSkills={setSkills} />
                </div>
                <input placeholder="Education" value={education} onChange={e => setEducation(e.target.value)} className="border p-2 rounded" />
                <input type="date" required min="2025-04-17" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="border p-2 rounded" />
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {jobsLoading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => (
            <JobListingRecruiter key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
