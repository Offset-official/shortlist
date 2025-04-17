"use client"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const RecruiterDashboard = () => {
  const [open, setOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const { data: session } = useSession();
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [salary, setSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  type Candidate = {
    id: Key | null | undefined;
    name: string;
    email: string;
    resume?: string;
  };
  
  type Job = {
    id: Key | null | undefined;
    title: string;
    location: string;
    employmentType: string;
    status?: string;
    postedDate: string;
    candidates: Candidate[];
  };
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      setJobsLoading(true);
      try {
        const res = await fetch("/api/getRecruiterJobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
        // Optionally handle error
      }
      setJobsLoading(false);
    }
    fetchJobs();
  }, []);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/add_job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        alert(error || "Failed to create job listing");
        setLoading(false);
        return;
      }
      setOpen(false);
      setJobTitle("");
      setJobDesc("");
      setLocation("");
      setRemote(false);
      setSalary("");
      setEmploymentType("");
      setExperienceLevel("");
      setJobRole("");
      setSkills([]);
      setEducation("");
      setExpiryDate("");
      setLoading(false);
    } catch (err) {
      alert("Error creating job listing");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-5xl font-bold mb-6">ShortList</h1>
      <p className="mb-8 text-xl text-secondary font-bold">
        Recruiter Dashboard!
      </p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">5</span>
          <span className="text-muted-foreground mt-2">Jobs Posted</span>
        </div>
        <div className="bg-card rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">23</span>
          <span className="text-muted-foreground mt-2">Total Applicants</span>
        </div>
        <div className="bg-card rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold">2</span>
          <span className="text-muted-foreground mt-2">Interviews Scheduled</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-10">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition">Add Job Listing</Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Add Job Listing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleJobSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block mb-1 font-medium">Job Title</label>
                  <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} required className="w-full border rounded p-2" placeholder="e.g. Frontend Developer" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Remote, New York" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} id="remote" />
                  <label htmlFor="remote" className="font-medium">Remote</label>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Salary</label>
                  <input value={salary} onChange={e => setSalary(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. $100k - $120k" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Employment Type</label>
                  <input value={employmentType} onChange={e => setEmploymentType(e.target.value)} required className="w-full border rounded p-2" placeholder="Full-time, Part-time, etc." />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Experience Level</label>
                  <input value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="w-full border rounded p-2" placeholder="Entry, Mid, Senior" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Job Role</label>
                  <input value={jobRole} onChange={e => setJobRole(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. Software Engineer" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} required className="w-full border rounded p-2 min-h-[120px]" placeholder="Describe the job..." />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Skills (add and press Enter)</label>
                  <SkillTagInput skills={skills} setSkills={setSkills} />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Education</label>
                  <input value={education} onChange={e => setEducation(e.target.value)} className="w-full border rounded p-2" placeholder="e.g. B.Tech, M.Sc." />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full border rounded p-2" min="2025-04-17" />
                </div>
                <div className="flex flex-row gap-2 mt-auto">
                  <Button type="submit" className="bg-primary w-1/2" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-1/2 min-w-0">Cancel</Button>
                  </DialogClose>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <a href="/interview" className="bg-tertiary text-foreground px-6 py-3 rounded-lg font-semibold shadow hover:bg-tertiary/90 transition">Interview</a>
      </div>

      {/* Applicants Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Job Listings & Applicants</h2>
        {jobsLoading ? (
          <div>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-muted-foreground">No job listings found.</div>
        ) : (
          <div className="space-y-8">
            {jobs.map(job => (
              <div key={job.id} className="border rounded-lg p-6 bg-card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{job.title}</h3>
                    <div className="text-sm text-muted-foreground">{job.location} • {job.employmentType} • {job.status}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Posted: {new Date(job.postedDate).toLocaleDateString()}</div>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Applicants:</span>
                  {job.candidates.length === 0 ? (
                    <span className="ml-2 text-muted-foreground">No applicants yet.</span>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {job.candidates.map((applicant: Candidate) => (
                        <li key={applicant.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between bg-background">
                          <div>
                            <span className="font-semibold text-foreground">{applicant.name || "No Name"}</span>
                            <span className="ml-2 text-muted-foreground">{applicant.email}</span>
                          </div>
                          {applicant.resume && (
                            <a href={typeof applicant.resume === 'string' ? applicant.resume : '#'} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs mt-1 md:mt-0">View Resume</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// Interface for SkillTagInput props
interface SkillTagInputProps {
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
}

// SkillTagInput component for tag-style skill entry
function SkillTagInput({ skills, setSkills }: SkillTagInputProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!skills.includes(input.trim())) {
        setSkills([...skills, input.trim()]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && skills.length > 0) {
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
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? "e.g. React, Node.js, SQL" : "Add skill..."}
        />
      </div>
    );
  }

export default RecruiterDashboard;