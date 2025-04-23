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

const DSA_TOPICS = [
  { topic: 'Arrays', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Strings', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Linked List', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Trees', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Graphs', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Dynamic Programming', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Recursion', difficulties: ['Easy', 'Medium', 'Hard'] },
  { topic: 'Searching & Sorting', difficulties: ['Easy', 'Medium', 'Hard'] },
];

const NON_DSA_TOPICS = [
  'Web Development',
  'Game Development',
  'Mobile Development',
  'AI/ML',
  'Blockchain',
];

const HR_TOPICS = [
  'Behaviour',
  'Communication',
  'Teamwork',
  'Leadership',
  'Problem Solving',
  'Conflict Resolution',
  'Adaptability',
];

const LANGUAGES = [
  'Python',
  'JavaScript',
  'Java',
  'C++',
  'Go',
  'TypeScript',
  'C#',
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
  const [expiryDateTime, setExpiryDateTime] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('Python');
  const [dsaTopics, setDsaTopics] = useState<{ topic: string; difficulty: string }[]>([]);
  const [nonDsaTopics, setNonDsaTopics] = useState<string[]>([]);
  const [hrTopics, setHrTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(2);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // DSA topic selection
  const toggleDsaTopic = (topic: string, difficulty: string, checked: boolean) => {
    setDsaTopics((prev) => {
      if (checked) {
        return [...prev, { topic, difficulty }];
      } else {
        return prev.filter((t) => !(t.topic === topic && t.difficulty === difficulty));
      }
    });
  };

  // Non-DSA topic selection
  const toggleNonDsaTopic = (topic: string, checked: boolean) => {
    setNonDsaTopics((prev) =>
      checked ? [...prev, topic] : prev.filter((t) => t !== topic)
    );
  };

  // HR topic selection
  const toggleHrTopic = (topic: string, checked: boolean) => {
    setHrTopics((prev) =>
      checked ? [...prev, topic] : prev.filter((t) => t !== topic)
    );
  };

  /* POST /api/add_interview */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!expiryDateTime) return;
    // Validate expiryDateTime string
    const selected = new Date(expiryDateTime);
    if (isNaN(selected.getTime())) {
      setErrorMsg('Invalid expiry date & time. Please select a valid date and time.');
      return;
    }
    const now = new Date();
    if (selected < now) {
      setErrorMsg(`Expiry date & time cannot be before the current time. Current time: ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
      return;
    }

    if (type === 'TECHNICAL') {
      if (dsaTopics.length < 1) {
        setErrorMsg('Select at least 1 DSA topic (with difficulty) for technical interview.');
        return;
      }
      if (numQuestions < 1) {
        setErrorMsg('Number of questions must be at least 1.');
        return;
      }
    }
    if (type === 'HR') {
      if (hrTopics.length < 2) {
        setErrorMsg('Select at least 2 HR topics.');
        return;
      }
      if (numQuestions < 1) {
        setErrorMsg('Number of questions must be at least 1.');
        return;
      }
    }
    setLoading(true);

    const payload: any = {
      candidateId,
      jobListingId,
      type,
      expiryDateTime: selected.toISOString(), // always send valid ISO string
      numQuestions,
    };
    if (type === 'TECHNICAL') {
      payload.programmingLanguage = programmingLanguage;
      payload.dsaTopics = dsaTopics;
      payload.topics = nonDsaTopics;
    } else {
      payload.hrTopics = hrTopics;
    }

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
        setDsaTopics([]);
        setNonDsaTopics([]);
        setHrTopics([]);
        setNumQuestions(2);
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
          {/* Expiry date & time */}
          <div>
            <Label htmlFor="expiry">Interview Expiry Date & Time</Label>
            <Input
              id="expiry"
              type="datetime-local"
              required
              min={new Date().toISOString().slice(0, 16)}
              value={expiryDateTime}
              onChange={e => setExpiryDateTime(e.target.value)}
            />
          </div>

          {/* Date & time */}
          {/* <div>
            <Label htmlFor="scheduled">Date & Time</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              required
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
            />
          </div> */}

          {/* Interview type */}
          <div>
            <Label htmlFor="type">Interview Type</Label>
            <select
              id="type"
              className="mt-1 block w-full rounded border"
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'TECHNICAL' | 'HR');
                setDsaTopics([]);
                setNonDsaTopics([]);
                setHrTopics([]);
              }}
            >
              <option value="TECHNICAL">Technical</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Technical interview details */}
          {type === 'TECHNICAL' && (
            <>
              <div>
                <Label>Programming Language</Label>
                <select
                  className="mt-1 block w-full rounded border"
                  value={programmingLanguage}
                  onChange={e => setProgrammingLanguage(e.target.value)}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>DSA Topics (at least 1, with difficulty)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {DSA_TOPICS.map(({ topic, difficulties }) => (
                    <div key={topic} className="flex flex-col">
                      <span className="font-medium text-xs">{topic}</span>
                      <div className="flex flex-row gap-2">
                        {difficulties.map(diff => (
                          <label key={diff} className="flex items-center space-x-1 text-xs">
                            <Checkbox
                              checked={!!dsaTopics.find(t => t.topic === topic && t.difficulty === diff)}
                              onCheckedChange={chk => toggleDsaTopic(topic, diff, chk as boolean)}
                            />
                            <span>{diff}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Other Technical Topics (optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {NON_DSA_TOPICS.map(topic => (
                    <label key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        checked={nonDsaTopics.includes(topic)}
                        onCheckedChange={chk => toggleNonDsaTopic(topic, chk as boolean)}
                      />
                      <span className="text-sm">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                />
              </div>
            </>
          )}

          {/* HR interview details */}
          {type === 'HR' && (
            <>
              <div>
                <Label>HR Topics (choose at least 2)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {HR_TOPICS.map(topic => (
                    <label key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        checked={hrTopics.includes(topic)}
                        onCheckedChange={chk => toggleHrTopic(topic, chk as boolean)}
                      />
                      <span className="text-sm">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={e => setNumQuestions(Number(e.target.value))}
                />
              </div>
            </>
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
              disabled={loading || (type === 'TECHNICAL' && dsaTopics.length < 1) || (type === 'HR' && hrTopics.length < 2)}
            >
              {loading ? 'Scheduling…' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
