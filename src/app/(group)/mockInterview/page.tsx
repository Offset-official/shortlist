'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

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

export default function MockInterviewPage() {
  /* ───── Auth guard ───── */
  const { data: session, status } = useSession();
  const router = useRouter();

  /* ───── Component state ───── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState<'TECHNICAL' | 'HR'>('TECHNICAL');
  const [programmingLanguage, setProgrammingLanguage] = useState('Python');
  const [dsaTopics, setDsaTopics] = useState<{ topic: string; difficulty: string }[]>([]);
  const [nonDsaTopics, setNonDsaTopics] = useState<string[]>([]);
  const [hrTopics, setHrTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(3);
  const [screenpipe, setScreenpipe] = useState(false); // Explicitly false
  const [terminator, setTerminator] = useState(false); // Explicitly false

  const params = useSearchParams();
  const dsaId = params.get('dsaId');
  const dsaTitle = params.get('title');
  const dsaDifficulty = params.get('difficulty');
  const isDSAMock = !!dsaId;

  /* ───── Only allow candidates ───── */
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.type !== 'candidate') router.replace('/');
  }, [session, status, router]);

  /* ───── If DSA mock, preset values ───── */
  useEffect(() => {
    if (isDSAMock) {
      setType('TECHNICAL');
      setNumQuestions(1);
      // Ensure screenpipe and terminator are reset for DSA mock
      setScreenpipe(false);
      setTerminator(false);
    }
  }, [isDSAMock]);

  /* ───── Topic toggles ───── */
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

  /* ───── Submit handler ───── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug: Log state values before submission
    console.log('Submitting form with state:', { screenpipe, terminator });

    try {
      const payload: Record<string, unknown> = {
        type,
        numQuestions,
        mock: true,
        screenpipe, // Include Screenpipe in payload
        terminator, // Include Terminator in payload
      };
      if (isDSAMock) {
        payload.dsaId = Number(dsaId);
      }
      if (type === 'TECHNICAL') {
        Object.assign(payload, {
          programmingLanguage,
          dsaTopics,
          topics: nonDsaTopics,
        });
      } else {
        payload.hrTopics = hrTopics;
      }

      // Debug: Log the payload before sending
      console.log('Payload:', payload);

      const res = await fetch('/api/add_mock_interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create mock interview');
      const { id } = await res.json();
      router.push(`/interview?id=${id}&mock=true`);
    } catch (err: any) {
      setError(err.message || 'Error creating mock interview');
    } finally {
      setLoading(false);
    }
  };

  /* ───── UI  ───── */
  return (
    <div className="mx-auto my-12 max-w-2xl px-4">
      <Card className="border border-border bg-card text-card-foreground shadow-lg">
        <CardContent className="py-8">
          <h1 className="mb-6 text-3xl font-semibold tracking-tight">
            {isDSAMock ? 'Start a Mock Interview' : 'Schedule a Mock Interview'}
          </h1>

          {isDSAMock && (
            <div className="mb-4 p-4 rounded bg-secondary border-secondary">
              <div className="font-bold text-lg">DSA Mock Interview</div>
              <div className="mt-1 text-base">
                <span className="font-medium">{dsaTitle}</span>
                <span className="ml-2 px-2 py-1 rounded bg-muted-foreground text-muted">
                  {dsaDifficulty}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isDSAMock && (
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
                    setScreenpipe(false); // Reset on type change
                    setTerminator(false); // Reset on type change
                  }}
                  className="mt-1 w-full rounded-md border border-input bg-background py-2 px-3 text-foreground"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="HR">HR</option>
                </select>
              </div>
            )}

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

                {isDSAMock ? (
                  <div>
                    <Label>DSA Topic</Label>
                    <div className="mt-2 p-2 border rounded bg-muted">
                      <span className="font-medium text-foreground">{dsaTitle}</span>
                      <span className="ml-2 px-2 py-1 rounded bg-muted-foreground text-muted">
                        {dsaDifficulty}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label>
                      DSA Topics <span className="text-xs opacity-70">(at least 1)</span>
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {DSA_TOPICS.map(({ topic, difficulties }) => (
                        <fieldset key={topic} className="rounded-lg border border-border p-2">
                          <legend className="px-1 text-sm font-medium text-foreground">{topic}</legend>
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
                )}

                {!isDSAMock && (
                  <div>
                    <Label>
                      Other Technical Topics <span className="text-xs opacity-70">(optional)</span>
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {NON_DSA_TOPICS.map((topic) => (
                        <label
                          key={topic}
                          className="flex items-center space-x-2 text-sm text-foreground"
                        >
                          <Checkbox
                            checked={nonDsaTopics.includes(topic)}
                            onCheckedChange={(chk) => toggleNonDsaTopic(topic, chk as boolean)}
                          />
                          <span>{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {type === 'HR' && !isDSAMock && (
              <div>
                <Label>
                  HR Topics <span className="text-xs opacity-70">(choose ≥ 2)</span>
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {HR_TOPICS.map((topic) => (
                    <label
                      key={topic}
                      className="flex items-center space-x-2 text-sm text-foreground"
                    >
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

            {/* Mock Interview Settings for all cases */}
            <div>
              <Label>Mock Interview Settings</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="flex items-center space-x-2 text-sm text-foreground">
                  <Checkbox
                    checked={screenpipe}
                    onCheckedChange={(chk) => {
                      setScreenpipe(chk as boolean);
                      console.log('Screenpipe toggled to:', chk); // Debug checkbox change
                    }}
                  />
                  <span>Enable Screenpipe (Suspicion Detection)</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-foreground">
                  <Checkbox
                    checked={terminator}
                    onCheckedChange={(chk) => {
                      setTerminator(chk as boolean);
                      console.log('Terminator toggled to:', chk); // Debug checkbox change
                    }}
                  />
                  <span>Enable Terminator</span>
                </label>
              </div>
            </div>

            {!isDSAMock && (
              <div>
                <Label htmlFor="qty">Number of Questions</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            )}

            {error && <p className="text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={
                loading ||
                (!isDSAMock && type === 'TECHNICAL' && dsaTopics.length < 1) ||
                (!isDSAMock && type === 'HR' && hrTopics.length < 2)
              }
              className="w-full"
            >
              {isDSAMock
                ? 'Start Mock Interview'
                : loading
                ? 'Scheduling…'
                : 'Schedule Mock Interview'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}