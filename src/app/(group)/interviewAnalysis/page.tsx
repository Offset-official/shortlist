'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function ChatHistoryModal({ chatHistory, onClose }: { chatHistory: any; onClose: () => void }) {
  // Handle both array and object chatHistory
  let messages: { role: string; content: string }[] = [];
  if (Array.isArray(chatHistory)) {
    messages = chatHistory;
  } else if (chatHistory && typeof chatHistory === 'object' && Array.isArray(chatHistory.messages)) {
    messages = chatHistory.messages;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full rounded-lg shadow-xl p-6 relative max-h-[80vh] flex flex-col">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chat History</h2>
        <div className="flex-1 overflow-y-auto text-sm bg-gray-50 p-4 rounded-md border border-gray-200">
          {messages.length > 0 ? (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 p-3 rounded-lg ${
                  msg.role === 'assistant' ? 'bg-blue-100' : 'bg-green-100'
                }`}
              >
                <span className="font-semibold text-gray-800 capitalize">{msg.role}:</span>{' '}
                <span className="whitespace-pre-line text-gray-700">{msg.content}</span>
              </div>
            ))
          ) : (
            <pre className="text-gray-600">{JSON.stringify(chatHistory, null, 2)}</pre>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-red-600 text-center">Missing interviewId in query.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-gray-600 text-center">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="max-w-md p-6">
          <CardContent>
            <p className="text-gray-600 text-center">No analysis data found.</p>
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
    <div className="min-h-screen bg-gray-100 py-12">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-gray-800">
            {data.mock ? 'Mock Interview Analysis' : 'Interview Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <strong className="text-gray-700">Candidate:</strong>{' '}
              <span className="text-gray-900">{data.candidate?.name || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Role:</strong>{' '}
              <span className="text-gray-900">{data.jobListing?.title || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Interview Type:</strong>{' '}
              <span className="text-gray-900">{data.type || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Started At:</strong>{' '}
              <span className="text-gray-900">{formatDate(data.interviewStartedAt)}</span>
            </div>
            <div>
              <strong className="text-gray-700">Ended At:</strong>{' '}
              <span className="text-gray-900">{formatDate(data.interviewEndedAt)}</span>
            </div>
            {isDSAMock && (
              <div>
                <strong className="text-gray-700">DSA Question ID:</strong>{' '}
                <span className="text-gray-900">{data.dsaId}</span>
              </div>
            )}
            {isTechnical && (
              <div>
                <strong className="text-gray-700">DSA Topics:</strong>{' '}
                <span className="text-gray-900">
                  {Array.isArray(data.dsaTopics)
                    ? data.dsaTopics.map((t: any) => `${t.topic} (${t.difficulty})`).join(', ')
                    : '–'}
                </span>
              </div>
            )}
            {isTechnical && (
              <div>
                <strong className="text-gray-700">Other Technical Topics:</strong>{' '}
                <span className="text-gray-900">
                  {Array.isArray(data.topics) ? data.topics.join(', ') : '–'}
                </span>
              </div>
            )}
            {isTechnical && (
              <div>
                <strong className="text-gray-700">Programming Language:</strong>{' '}
                <span className="text-gray-900">{data.programmingLanguage || '–'}</span>
              </div>
            )}
            {isHR && (
              <div>
                <strong className="text-gray-700">HR Topics:</strong>{' '}
                <span className="text-gray-900">
                  {Array.isArray(data.hrTopics) ? data.hrTopics.join(', ') : '–'}
                </span>
              </div>
            )}
            <div>
              <strong className="text-gray-700">Number of Questions:</strong>{' '}
              <span className="text-gray-900">{data.numQuestions || '–'}</span>
            </div>
            <div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowChat(true)}
              >
                View Chat History
              </Button>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <h2 className="text-2xl font-semibold text-gray-800">AI Analysis</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <strong className="text-gray-700">Completed Questions:</strong>{' '}
              <span className="text-gray-900">
                {analysis.completedQuestions !== undefined
                  ? `${analysis.completedQuestions} / ${data.numQuestions}`
                  : '–'}
              </span>
            </div>
            <div>
              <strong className="text-gray-700">Question Performance Summary:</strong>{' '}
              <span className="text-gray-900">{analysis.questionSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Face Summary:</strong>{' '}
              <span className="text-gray-900">{analysis.faceSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Pose Summary:</strong>{' '}
              <span className="text-gray-900">{analysis.poseSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Pose Stability:</strong>{' '}
              <span className="text-gray-900">{analysis.poseStability ? `${analysis.poseStability}%` : '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Face Visibility:</strong>{' '}
              <span className="text-gray-900">{analysis.faceVisibility ? `${analysis.faceVisibility}%` : '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Violation Count:</strong>{' '}
              <span className="text-gray-900">{analysis.violationCount ?? '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Suspicion Summary:</strong>{' '}
              <span className="text-gray-900">{analysis.suspicionSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Violation Summary:</strong>{' '}
              <span className="text-gray-900">{analysis.violationSummary || '–'}</span>
            </div>
            <div>
              <strong className="text-gray-700">Face Direction Distribution:</strong>
              {analysis.faceDirectionDistribution ? (
                <ul className="ml-6 mt-2 list-disc text-gray-900">
                  {Object.entries(analysis.faceDirectionDistribution).map(([dir, val]) => (
                    <li key={dir}>
                      {dir}: {val as number}%
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-900 ml-2">–</span>
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