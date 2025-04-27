'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function ChatHistoryModal({
  chatHistory,
  onClose,
}: {
  chatHistory: any;
  onClose: () => void;
}) {
  let messages: { role: string; content: string }[] = [];
  if (Array.isArray(chatHistory)) {
    messages = chatHistory;
  } else if (chatHistory && typeof chatHistory === 'object' && Array.isArray(chatHistory.messages)) {
    messages = chatHistory.messages;
  }

  return (
    <div className="fixed inset-0 bg-[var(--color-foreground)]/50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-card)] text-[var(--color-card-foreground)] max-w-2xl w-full rounded-lg shadow-xl p-6 relative max-h-[80vh] flex flex-col">
        <button
          className="absolute top-4 right-4 text-2xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition"
          onClick={onClose}
        >
          &times;
        </button>
        <CardTitle className="text-2xl font-semibold mb-4 text-[var(--color-foreground)]">
          Chat History
        </CardTitle>
        <div className="flex-1 overflow-y-auto chat-scroll p-4 rounded-md border border-border">
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 p-3 rounded-lg ${
                  msg.role === 'assistant'
                    ? 'bg-[var(--color-secondary)]/20'
                    : 'bg-[var(--color-tertiary)]/20'
                }`}
              >
                <span className="font-semibold capitalize text-[var(--color-foreground)]">
                  {msg.role}:
                </span>
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return !inline ? (
                        <pre className="overflow-x-auto chat-scroll rounded bg-[var(--color-muted)] p-2">
                          <code className="font-mono text-sm" {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-[var(--color-muted)] px-1 rounded font-mono text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ))
          ) : (
            <pre className="text-[var(--color-muted-foreground)]">{JSON.stringify(chatHistory, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewAnalysisPage() {
  const params = useSearchParams();
  const interviewId = params?.get('interviewId');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!interviewId) return;
    setLoading(true);
    fetch(`/api/interviewAnalysis?interviewId=${interviewId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch analysis');
        setLoading(false);
      });
  }, [interviewId]);

  if (!interviewId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-[var(--color-destructive)] text-center">
              Missing interviewId in query.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-[var(--color-muted-foreground)] text-center">
              Loading...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-[var(--color-destructive)] text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-[var(--color-muted-foreground)] text-center">
              No analysis data found.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analysis = data.interviewAnalysis || {};
  const isDSAMock = !!data.dsaId;
  const isTechnical = data.type === 'TECHNICAL';
  const isHR = data.type === 'HR';

  return (
    <div className="min-h-screen bg-background py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-foreground">
            {data.mock ? 'Mock Interview Analysis' : 'Interview Analysis'}
          </CardTitle>
          <h3>Powered by <b>Groq</b></h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Candidate:</strong>{' '}
              <span className="text-foreground">{data.candidate?.name || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Role:</strong>{' '}
              <span className="text-foreground">{data.jobListing?.title || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Interview Type:</strong>{' '}
              <span className="text-foreground">{data.type || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Started At:</strong>{' '}
              <span className="text-foreground">
                {formatDate(data.interviewStartedAt)}
              </span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Ended At:</strong>{' '}
              <span className="text-foreground">
                {formatDate(data.interviewEndedAt)}
              </span>
            </div>
            {isDSAMock && (
              <div>
                <strong className="text-[var(--color-muted-foreground)]">DSA Question ID:</strong>{' '}
                <span className="text-foreground">{data.dsaId}</span>
              </div>
            )}
            {isTechnical && (
              <div>
                <strong className="text-[var(--color-muted-foreground)]">DSA Topics:</strong>{' '}
                <span className="text-foreground">
                  {Array.isArray(data.dsaTopics)
                    ? data.dsaTopics
                        .map((t: any) => `${t.topic} (${t.difficulty})`)
                        .join(', ')
                    : '–'}
                </span>
              </div>
            )}
            {isTechnical && (
              <div>
                <strong className="text-[var(--color-muted-foreground)]">Other Technical Topics:</strong>{' '}
                <span className="text-foreground">
                  {Array.isArray(data.topics) ? data.topics.join(', ') : '–'}
                </span>
              </div>
            )}
            {isTechnical && (
              <div>
                <strong className="text-[var(--color-muted-foreground)]">Programming Language:</strong>{' '}
                <span className="text-foreground">{data.programmingLanguage || '–'}</span>
              </div>
            )}
            {isHR && (
              <div>
                <strong className="text-[var(--color-muted-foreground)]">HR Topics:</strong>{' '}
                <span className="text-foreground">
                  {Array.isArray(data.hrTopics) ? data.hrTopics.join(', ') : '–'}
                </span>
              </div>
            )}
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Number of Questions:</strong>{' '}
              <span className="text-foreground">{data.numQuestions || '–'}</span>
            </div>
            <div>
              <Button
                className="bg-primary hover:bg-secondary text-primary-foreground"
                onClick={() => setShowChat(true)}
              >
                View Chat History
              </Button>
            </div>
          </div>

          <hr className="my-6 border-border" />

          <h2 className="text-2xl font-semibold text-foreground">AI Analysis</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Completed Questions:</strong>{' '}
              <span className="text-foreground">
                {analysis.completedQuestions !== undefined
                  ? `${analysis.completedQuestions} / ${data.numQuestions}`
                  : '–'}
              </span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Question Performance Summary:</strong>{' '}
              <span className="text-foreground">{analysis.questionSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Face Summary:</strong>{' '}
              <span className="text-foreground">{analysis.faceSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Pose Summary:</strong>{' '}
              <span className="text-foreground">{analysis.poseSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Pose Stability:</strong>{' '}
              <span className="text-foreground">
                {analysis.poseStability ? `${analysis.poseStability}%` : '–'}
              </span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Face Visibility:</strong>{' '}
              <span className="text-foreground">
                {analysis.faceVisibility ? `${analysis.faceVisibility}%` : '–'}
              </span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Violation Count:</strong>{' '}
              <span className="text-foreground">{analysis.violationCount ?? '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Suspicion Summary:</strong>{' '}
              <span className="text-foreground">{analysis.suspicionSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Violation Summary:</strong>{' '}
              <span className="text-foreground">{analysis.violationSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-[var(--color-muted-foreground)]">Face Direction Distribution:</strong>
              {analysis.faceDirectionDistribution ? (
                <ul className="ml-6 mt-2 list-disc text-foreground">
                  {Object.entries(analysis.faceDirectionDistribution).map(([dir, val]) => (
                    <li key={dir}>
                      {dir}: {val as number}%
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-foreground ml-2">–</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showChat && (
        <ChatHistoryModal chatHistory={data.chatHistory} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
