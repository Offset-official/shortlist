import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const [programmingLanguage, setProgrammingLanguage] = useState('Python');
  const [dsaTopics, setDsaTopics] = useState<{ topic: string; difficulty: string }[]>([]);
  const [nonDsaTopics, setNonDsaTopics] = useState<string[]>([]);
  const [hrTopics, setHrTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(2);
  const [screenpipeRequired, setScreenpipeRequired] = useState(true);
  const [terminatorRequired, setTerminatorRequired] = useState(false);
  const [expiryDateTime, setExpiryDateTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDsaTopic = (topic: string, difficulty: string, checked: boolean) =>
    setDsaTopics((prev) =>
      checked
        ? [...prev, { topic, difficulty }]
        : prev.filter((t) => !(t.topic === topic && t.difficulty === difficulty))
    );

  const toggleNonDsaTopic = (topic: string, checked: boolean) =>
    setNonDsaTopics((prev) => (checked ? [...prev, topic] : prev.filter((t) => t !== topic)));

  const toggleHrTopic = (topic: string, checked: boolean) =>
    setHrTopics((prev) => (checked ? [...prev, topic] : prev.filter((t) => t !== topic)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!expiryDateTime) {
      setError('Please select an expiry date and time.');
      setLoading(false);
      return;
    }
    const selected = new Date(expiryDateTime);
    if (isNaN(selected.getTime())) {
      setError('Invalid expiry date & time. Please select a valid date and time.');
      setLoading(false);
      return;
    }
    const now = new Date();
    if (selected < now) {
      setError(
        `Expiry date & time cannot be before the current time. Current time: ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
      );
      setLoading(false);
      return;
    }

    if (type === 'TECHNICAL' && dsaTopics.length < 1) {
      setError('Select at least 1 DSA topic (with difficulty) for technical interview.');
      setLoading(false);
      return;
    }
    if (type === 'HR' && hrTopics.length < 2) {
      setError('Select at least 2 HR topics.');
      setLoading(false);
      return;
    }
    if (numQuestions < 1) {
      setError('Number of questions must be at least 1.');
      setLoading(false);
      return;
    }

    const payload: any = {
      candidateId,
      jobListingId,
      type,
      expiryDateTime: selected.toISOString(),
      numQuestions,
      screenpipeRequired,
      terminatorRequired,
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

      if (res.ok) {
        onScheduled();
        onOpenChange(false);
      } else {
        let msg = 'Something went wrong.';
        try {
          const { error } = await res.json();
          msg = error ?? msg;
        } catch {
          msg = await res.text();
        }
        setError(msg || 'Server error.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <Card className="border border-border bg-card text-card-foreground shadow-lg">
          <CardContent className="py-8 px-6">
            <h1 className="text-3xl font-semibold tracking-tight mb-6">Schedule Interview</h1>

            {error && <p className="text-destructive mb-6">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grouped: Expiry & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Interview Expiry Date & Time</Label>
                  <Input
                    id="expiry"
                    type="datetime-local"
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    value={expiryDateTime}
                    onChange={(e) => setExpiryDateTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Interview Type</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as 'TECHNICAL' | 'HR');
                      setDsaTopics([]);
                      setNonDsaTopics([]);
                      setHrTopics([]);
                      setScreenpipeRequired(true);
                      setTerminatorRequired(false);
                    }}
                    className="mt-1 w-full rounded-md border border-input bg-background py-2 px-3 text-foreground"
                  >
                    <option value="TECHITICAL">Technical</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              {/* Technical Interview Details */}
              {type === 'TECHNICAL' && (
                <>
                  <div>
                    <Label htmlFor="language">Programming Language</Label>
                    <select
                      id="language"
                      value={programmingLanguage}
                      onChange={(e) => setProgrammingLanguage(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background py-2 px-3 text-foreground"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>
                      DSA Topics <span className="text-xs opacity-70">(at least 1)</span>
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {DSA_TOPICS.map(({ topic, difficulties }) => (
                        <fieldset key={topic} className="rounded-lg border border-border p-2">
                          <legend className="px-1 text-sm font-medium text-foreground">
                            {topic}
                          </legend>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {difficulties.map((diff) => (
                              <label
                                key={diff}
                                className="flex items-center space-x-1 text-xs text-foreground"
                              >
                                <Checkbox
                                  checked={!!dsaTopics.find((t) => t.topic === topic && t.difficulty === diff)}
                                  onCheckedChange={(chk) => toggleDsaTopic(topic, diff, chk as boolean)}
                                />
                                <span>{diff}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>
                      Other Technical Topics <span className="text-xs opacity-70">(optional)</span>
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {NON_DSA_TOPICS.map((topic) => (
                        <label key={topic} className="flex items-center space-x-2 text-sm text-foreground">
                          <Checkbox
                            checked={nonDsaTopics.includes(topic)}
                            onCheckedChange={(chk) => toggleNonDsaTopic(topic, chk as boolean)}
                          />
                          <span>{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* HR Interview Details */}
              {type === 'HR' && (
                <div>
                  <Label>
                    HR Topics <span className="text-xs opacity-70">(choose ≥ 2)</span>
                  </Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {HR_TOPICS.map((topic) => (
                      <label key={topic} className="flex items-center space-x-2 text-sm text-foreground">
                        <Checkbox
                          checked={hrTopics.includes(topic)}
                          onCheckedChange={(chk) => toggleHrTopic(topic, chk as boolean)}
                        />
                        <span>{topic}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Settings */}
              <div>
                <Label>Interview Settings</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-sm text-foreground">
                    <Checkbox
                      checked={screenpipeRequired}
                      onCheckedChange={(chk) => setScreenpipeRequired(!!chk)}
                    />
                    <span>Enable Screenpipe (Suspicion Detection)</span>
                  </label>
                  {/* <label className="flex items-center space-x-2 text-sm text-foreground">
                    <Checkbox
                      checked={terminatorRequired}
                      onCheckedChange={(chk) => setTerminatorRequired(!!chk)}
                    />
                    <span>Enable Terminator (UI Restriction)</span>
                  </label> */}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <Label htmlFor="qty">Number of Questions</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= 10) setNumQuestions(value);
                  }}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    (type === 'TECHNICAL' && dsaTopics.length < 1) ||
                    (type === 'HR' && hrTopics.length < 2)
                  }
                >
                  {loading ? 'Scheduling…' : 'Schedule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
