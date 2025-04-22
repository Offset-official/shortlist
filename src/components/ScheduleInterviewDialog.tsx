// components/ScheduleInterviewDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const TOPIC_OPTIONS = [
  'DSA - Easy',
  'DSA - Medium',
  'DSA - Hard',
  'Web Development',
  'Game Development',
  'Mobile Development',
  'AI/ML',
  'Blockchain',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: number;
  jobListingId: number;
  onScheduled: () => void;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidateId,
  jobListingId,
  onScheduled,
}: Props) {
  const [type, setType] = useState<'TECHNICAL' | 'HR'>('TECHNICAL');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* Toggle checkboxes – max 3 topics */
  const toggleTopic = (topic: string, checked: boolean) => {
    setTopics((prev) =>
      checked
        ? prev.length < 3
          ? [...prev, topic]
          : prev
        : prev.filter((t) => t !== topic)
    );
  };

  /* POST /api/add_interview */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate technical topics
    if (type === 'TECHNICAL' && topics.length < 2) {
      setErrorMsg('Please select at least two topics for a technical interview.');
      return;
    }

    if (!scheduledDateTime) return;
    setLoading(true);

    const payload = {
      candidateId,
      jobListingId,
      type,
      topics: type === 'TECHNICAL' ? topics : [],
      scheduledDateTime: new Date(scheduledDateTime).toISOString(),
    };

    try {
      const res = await fetch('/api/add_interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (res.ok) {
        onScheduled();
        onOpenChange(false);
        setScheduledDateTime('');
        setTopics([]);
        setType('TECHNICAL');
      } else {
        let msg = 'Something went wrong.';
        try {
          const { error } = await res.json();
          msg = error ?? msg;
        } catch {
          msg = await res.text();
        }
        setErrorMsg(msg || 'Server error.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>

        {/* Error banner */}
        {errorMsg && (
          <div className="rounded bg-red-50 border border-red-300 p-2 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & time */}
          <div>
            <Label htmlFor="scheduled">Date & Time</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              required
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
            />
          </div>

          {/* Interview type */}
          <div>
            <Label htmlFor="type">Interview Type</Label>
            <select
              id="type"
              className="mt-1 block w-full rounded border"
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'TECHNICAL' | 'HR');
                setTopics([]);
              }}
            >
              <option value="TECHNICAL">Technical</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Topics */}
          {type === 'TECHNICAL' && (
            <div>
              <Label>Topics (choose 2–3)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {TOPIC_OPTIONS.map((topic) => (
                  <label key={topic} className="flex items-center space-x-2">
                    <Checkbox
                      checked={topics.includes(topic)}
                      onCheckedChange={(chk) => toggleTopic(topic, chk as boolean)}
                      disabled={!topics.includes(topic) && topics.length >= 3}
                    />
                    <span className="text-sm">{topic}</span>
                  </label>
                ))}
              </div>
              {topics.length < 2 && (
                <p className="text-sm text-red-600 mt-1">
                  Please select at least two topics.
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || (type === 'TECHNICAL' && topics.length < 2)}
            >
              {loading ? 'Scheduling…' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
