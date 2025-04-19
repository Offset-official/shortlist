// components/CandidateDetailsPopup.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Candidate interface matching API response
 */
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
  onClose: () => void;
}

/**
 * Modal popup displaying detailed candidate information
 */
export default function CandidateDetailsPopup({ candidate, onClose }: CandidateDetailsPopupProps) {
  return (
    <Dialog open={true} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{candidate.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p><strong>Email:</strong> {candidate.email}</p>
          {candidate.location && <p><strong>Location:</strong> {candidate.location}</p>}
          <p><strong>Applied On:</strong> {new Date(candidate.createdAt).toLocaleDateString()}</p>
          <div>
            <strong>Skills:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {candidate.skills.map((s, idx) => (
                <Badge key={idx}>{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            {/* <strong>Dream Companies:</strong>
            <div className="flex flex-wrap gap-2 mt-1">
              {candidate.dreamCompanies.map((c, idx) => (
                <Badge key={idx} variant="secondary">{c}</Badge>
              ))}
            </div> */}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}