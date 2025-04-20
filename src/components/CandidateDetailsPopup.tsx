// components/CandidateDetailsPopup.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScheduleInterviewDialog } from './ScheduleInterviewDialog';

/** Candidate interface matching API response */
type Candidate = {
  id: number;
  name: string;
  email: string;
  year?: number;
  collegeName?: string;
  location?: string;
  resume?: any;
  dreamCompanies: string[];
  skills: string[];
  createdAt: string;
};

interface CandidateDetailsPopupProps {
  candidate: Candidate;
  jobListingId: number;
  onClose: () => void;
}

/** Modal popup displaying detailed candidate info + résumé + “Schedule Interview”. */
export default function CandidateDetailsPopup({
  candidate,
  jobListingId,
  onClose,
}: CandidateDetailsPopupProps) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const { resume } = candidate;
  // console.log("JOB LISTING ID", jobListingId);

  return (
    <>
      {/* Primary dialog */}
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{candidate.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 text-sm max-h-[70vh] overflow-y-auto pr-1">
            {/* Basic info */}
            <div>
              <p>
                <strong>Email:</strong> {candidate.email}
              </p>
              {candidate.location && (
                <p>
                  <strong>Location:</strong> {candidate.location}
                </p>
              )}
              <p>
                <strong>Applied On:</strong>{' '}
                {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Skills */}
            {candidate.skills.length > 0 && (
              <div>
                <strong>Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {candidate.skills.map((s, idx) => (
                    <Badge key={idx}>{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Résumé */}
            {resume ? (
              <div className="space-y-4">
                <strong>Résumé:</strong>

                {resume.personalInfo && (
                  <div>
                    <div className="font-semibold">
                      {resume.personalInfo.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resume.personalInfo.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resume.personalInfo.location}
                    </div>
                  </div>
                )}

                {resume.summary && (
                  <div>
                    <div className="font-semibold">Summary</div>
                    <div className="text-xs">{resume.summary}</div>
                  </div>
                )}

                {Array.isArray(resume.education) &&
                  resume.education.length > 0 && (
                    <div>
                      <div className="font-semibold">Education</div>
                      <ul className="list-disc ml-5 text-xs">
                        {resume.education.map((edu: any, idx: number) => (
                          <li key={idx}>
                            {edu.degree} at {edu.institution} ({edu.dates})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(resume.experience) &&
                  resume.experience.length > 0 && (
                    <div>
                      <div className="font-semibold">Experience</div>
                      <ul className="list-disc ml-5 text-xs">
                        {resume.experience.map((exp: any, idx: number) => (
                          <li key={idx}>
                            {exp.title} at {exp.company} ({exp.dates})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {resume.skills && (
                  <div>
                    <div className="font-semibold">Skills</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(resume.skills.technical || []).map(
                        (skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ),
                      )}
                      {(resume.skills.soft || []).map(
                        (skill: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {skill}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Raw JSON fallback */}
                {!(
                  resume.personalInfo ||
                  resume.summary ||
                  resume.education ||
                  resume.experience ||
                  resume.skills
                ) && (
                  <pre className="whitespace-pre-wrap text-xs bg-muted/20 p-2 rounded">
                    {JSON.stringify(resume, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <p>No résumé data available.</p>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => setIsScheduleOpen(true)}>
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secondary dialog for interview scheduling */}
      {isScheduleOpen && (
        <ScheduleInterviewDialog
          open={isScheduleOpen}
          onOpenChange={setIsScheduleOpen}
          candidateId={candidate.id}
          jobListingId={jobListingId}
          onScheduled={() => {
            // place for toast, refetch, etc.
            setIsScheduleOpen(false);
          }}  
        />
      )}
    </>
  );
}
