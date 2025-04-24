'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Markdown from 'react-markdown';
import CodeEditor from '@/components/CodeEditor';
import CameraRecorder from '@/components/CameraRecorder';
import TalkingHeadComponent from '@/components/TalkingAvatar';
import toast from 'react-hot-toast';
import { pipe } from '@screenpipe/browser';
import { Badge } from '@/components/ui/badge';

/* ----------------------------------------------------------- */
/* Helper: strip <SPEAKABLE> … </SPEAKABLE>                    */
/* ----------------------------------------------------------- */
function extractSpeakableContent(content: string) {
  const reg = /<SPEAKABLE>([\s hemeS]*?)<\/SPEAKABLE>/g;
  const matches = [...content.matchAll(reg)];
  const speakableText = matches.map((m) => m[1]).join(' ');
  const cleanedContent = content.replace(/<\/?SPEAKABLE>/g, '');
  return { speakableText, cleanedContent };
}

/* ----------------------------------------------------------- */
/* Helper: detect and wrap code in Markdown code blocks         */
/* ----------------------------------------------------------- */
function wrapCodeInMarkdown(input: string): string {
  // Simple heuristic to detect code: contains multiple lines, indentation, or common code keywords
  const isCode = input.includes('\n') || input.match(/^\s{2,}/m) || input.match(/\b(function|class|const|let|var|import|export)\b/);
  if (isCode) {
    // Wrap in triple backticks with optional language (default to 'tsx' for TypeScript/React)
    return `\`\`\`tsx\n${input}\n\`\`\``;
  }
  return input;
}

/* ------------------------------------------------------------ */
/* Screenpipe Types                                            */
/* ------------------------------------------------------------ */
type Status = 'retry' | 'init' | 'ready' | 'error';

export default function InterviewPage() {
  const params = useSearchParams();
  const interviewId = params.get('id') || '';
  const mock = params.get('mock') === 'true';
  const router = useRouter();

  /* Chat state */
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [speakableText, setSpeakableText] = useState('');

  /* Layout refs */
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'camera' | 'screenpipe'>('code');

  /* Readiness flags */
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenpipeReady, setScreenpipeReady] = useState(false);
  const [screenpipeRequired, setScreenpipeRequired] = useState(true);
  const [fetchedReqs, setFetchedReqs] = useState(false);

  /* 5-second probe timer (for UI and initial check) */
  const [probeOver, setProbeOver] = useState(false);

  /* Screenpipe state */
  const [status, setStatus] = useState<Status>('retry');
  const [everConnected, setEverConnected] = useState(false);
  const [initCountdown, setInitCountdown] = useState(5);
  const [bad, setBad] = useState(false);

  /* Violations state */
  const [violations, setViolations] = useState<{
    timestamp: string;
    website: string;
  }[]>([]);
  const [forbiddenWebsites] = useState([
    { name: 'google', pattern: 'google' },
    { name: 'chatgpt', pattern: 'chatgpt' },
    { name: 'stackoverflow', pattern: 'stackoverflow' },
    { name: 'github', pattern: 'github' },
    { name: 'wikipedia', pattern: 'wikipedia' },
  ]);

  /* Screenpipe refs for timers & status */
  const retryInterval = useRef<NodeJS.Timeout>();
  const retryTimer = useRef<NodeJS.Timeout>();
  const initInterval = useRef<NodeJS.Timeout>();
  const pollInterval = useRef<NodeJS.Timeout>();
  const statusRef = useRef<Status>(status);

  /* Keep statusRef in sync */
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  /* Helper: state setter for status */
  const changeStatus = (s: Status) => {
    setStatus(s);
    setScreenpipeReady(s === 'ready');
  };

  /* 5-second probe timer */
  useEffect(() => {
    if (probeOver) return;
    const t = setTimeout(() => setProbeOver(true), 5_000);
    return () => clearTimeout(t);
  }, [probeOver]);

  /* --------------------------------------------------------- */
  /* Fetch system prompt + requirements once                   */
  /* --------------------------------------------------------- */
  const fetchSystemPromptAndReqs = async () => {
    const r = await fetch(`/api/getInterviewSystemPrompt?id=${interviewId}&mock=${mock}`);
    const { systemPrompt, screenpipeRequired } = await r.json();
    setScreenpipeRequired(!!screenpipeRequired);
    setFetchedReqs(true);
    return systemPrompt as string;
  };

  /* --------------------------------------------------------- */
  /* Persist chat history                                      */
  /* --------------------------------------------------------- */
  const saveHistory = async (hist: any[]) => {
    if (!interviewId) return;
    await fetch('/api/interview/update_chat_history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewId, chatHistory: hist }),
    });
  };

  /* --------------------------------------------------------- */
  /* START INTERVIEW                                           */
  /* --------------------------------------------------------- */
  const handleStart = async () => {
    if (!fetchedReqs) await fetchSystemPromptAndReqs();

    if (!cameraEnabled) {
      toast.error('Please enable your camera before starting.');
      return;
    }

    if (screenpipeRequired && !screenpipeReady) {
      toast.error('Screenpipe is required but not ready. Please ensure Screenpipe is running.');
      return;
    }

    if (!interviewId) {
      router.push('/interview');
      return;
    }

    const ok = await fetch('/api/interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewId }),
    });
    if (!ok.ok) {
      const d = await ok.json();
      toast.error(d.error || 'Could not start interview');
      return;
    }

    setStarted(true);
    setLoading(true);
    try {
      const system = await fetchSystemPromptAndReqs();
      const userMsg = { role: 'user', content: '__START_INTERVIEW__' };
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMsg],
          systemInstruction: system,
        }),
      });
      const { reply } = await r.json();
      const { speakableText, cleanedContent } = extractSpeakableContent(reply);
      setSpeakableText(speakableText || cleanedContent);
      setMessages([{ role: 'assistant', content: cleanedContent }]);
      await saveHistory([{ role: 'assistant', content: cleanedContent }]);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------- */
  /* SEND USER MESSAGE                                         */
  /* --------------------------------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || over) return;
    const formattedInput = wrapCodeInMarkdown(input); // Wrap code in Markdown
    const user = { role: 'user', content: formattedInput };
    const next = [...messages, user];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      await saveHistory(next);
      const sys = sessionStorage.getItem('InterviewSystemPrompt')!;
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, systemInstruction: sys }),
      });
      const data = await r.json();
      const { speakableText, cleanedContent } = extractSpeakableContent(data.reply);
      setSpeakableText(speakableText || data.reply);
      const final = [...next, { role: 'assistant', content: cleanedContent }];
      setMessages(final);
      await saveHistory(final);
      if (data.isInterviewOver) setOver(true);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------- */
  /* Pre-fetch prompt once                                     */
  /* --------------------------------------------------------- */
  useEffect(() => {
    if (started) return;
    fetchSystemPromptAndReqs().then((sp) =>
      sessionStorage.setItem('InterviewSystemPrompt', sp)
    );
  }, [started]);

  /* --------------------------------------------------------- */
  /* Auto-scroll chat window                                   */
  /* --------------------------------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, over]);

  /* ===========================================================
     Screenpipe: RETRY – probe for ≤5s on page load
  ============================================================ */
  useEffect(() => {
    if (status !== 'retry') return;

    const probe = async () => {
      try {
        const res = await pipe.queryScreenpipe({
          startTime: new Date(Date.now() - 10_000).toISOString(),
          limit: 10,
          contentType: 'ocr',
        });

        setEverConnected(true);
        clearInterval(retryInterval.current);
        clearTimeout(retryTimer.current);
        changeStatus('ready');
        postDiagnostics(res);
      } catch (err: any) {
        const http = err?.response?.status ?? err?.status;
        if (http === 404) {
          setEverConnected(true);
          clearInterval(retryInterval.current);
          clearTimeout(retryTimer.current);
          changeStatus('ready');
        }
      }
    };

    probe();
    retryInterval.current = setInterval(probe, 1_000);
    retryTimer.current = setTimeout(() => {
      if (statusRef.current === 'retry') {
        changeStatus('error');
      }
    }, 5_000);

    return () => {
      clearInterval(retryInterval.current);
      clearTimeout(retryTimer.current);
    };
  }, [status]);

  /* ===========================================================
     Screenpipe: INIT – 5-s countdown to READY
  ============================================================ */
  useEffect(() => {
    if (status !== 'init') return;

    setInitCountdown(5);
    initInterval.current = setInterval(() => {
      setInitCountdown((c) => {
        if (c <= 1) {
          clearInterval(initInterval.current);
          changeStatus('ready');
          return 0;
        }
        return c - 1;
      });
    }, 1_000);

    return () => clearInterval(initInterval.current);
  }, [status]);

  /* ===========================================================
     Screenpipe: READY – poll every 10 s after interview starts
  ============================================================ */
  useEffect(() => {
    if (status !== 'ready' || !started) return;

    const poll = async () => {
      try {
        const res = await pipe.queryScreenpipe({
          startTime: new Date(Date.now() - 10_000).toISOString(),
          limit: 10,
          contentType: 'ocr',
        });
        postDiagnostics(res);
        analyse(res);
      } catch (err) {
        console.warn('[Screenpipe] poll failed – will retry', err);
      }
    };

    poll();
    pollInterval.current = setInterval(poll, 10_000);
    return () => clearInterval(pollInterval.current);
  }, [status, started]);

  /* Screenpipe: analysis of OCR results */
  function analyse(res: any) {
    let flagged = false;
    const newViolations: { timestamp: string; website: string }[] = [];

    res.data?.forEach((it: any) => {
      if (it.type !== 'OCR') return;
      const w = it.content.windowName?.toLowerCase() || '';
      if (!w.includes('connecting talent with opportunities')) {
        flagged = true;
      }

      forbiddenWebsites.forEach(website => {
        if (w.includes(website.pattern)) {
          newViolations.push({
            timestamp: new Date().toISOString(),
            website: website.name,
          });
        }
      });
    });

    if (newViolations.length > 0) {
      setViolations(prev => [...prev, ...newViolations]);
    }

    setBad(flagged);
  }

  /* Screenpipe: POST diagnostics payload */
  function postDiagnostics(res: any) {
    fetch('/api/diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poseData: null,
        faceData: null,
        cameraImage: null,
        screenpipeData: res,
        violations: violations,
        interviewId,
      }),
    }).catch(console.error);
  }

  /* Screenpipe: badge UI */
  const renderBadge = () => {
    switch (status) {
      case 'retry':
        return <Badge className="bg-orange-400 text-black">Retrying …</Badge>;
      case 'init':
        return (
          <Badge className="bg-yellow-400 text-black">
            Initialising … {initCountdown}s
          </Badge>
        );
      case 'ready':
        return bad ? (
          <>
            <Badge variant="destructive">Suspicious Activity in last 10s</Badge>
            {violations.map((v, i) => (
              <Badge key={i} variant="destructive" className="mt-2">
                {v.website.charAt(0).toUpperCase() + v.website.slice(1)} detected
              </Badge>
            ))}
          </>
        ) : (
          <Badge className="bg-green-400 text-black">All Clear in last 10s</Badge>
        );
      default:
        return everConnected ? (
          <Badge variant="destructive">Screenpipe connection lost.</Badge>
        ) : (
          <Badge variant="destructive">
            Screenpipe not found after 5 s. Start the back-end & refresh.
          </Badge>
        );
    }
  };

  /* --------------------------------------------------------- */
  /* RENDER                                                    */
  /* --------------------------------------------------------- */
  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* ---------------- LEFT: veinteCHat ---------------- */}
      <div className="w-1/2 flex flex-col h-screen pGFX 4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">
            {over ? 'Interview Complete' : 'Interview'}
          </h1>
        </header>

        {!started ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {probeOver && !screenpipeReady && (
              <div className="text-center" style={{ color: 'var(--destructive)' }}>
                Screenpipe not found. Please start the Screenpipe back-end and refresh.
              </div>
            )}
            <button
              onClick={handleStart}
              disabled={screenpipeRequired && !screenpipeReady}
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-md)',
                opacity: screenpipeRequired && !screenpipeReady ? 0.5 : 1,
                cursor: screenpipeRequired && !screenpipeReady ? 'not-allowed' : 'pointer',
              }}
              className="px-6 py-3 font-semibold transition-colors"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 chat-scroll">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 mx-4SfX 4 ${
                  i === 0 ? 'mt-4' : ''
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  {m.role === 'assistant' && <span className="text-xl">🤖</span>}
                </div>
                <div className="p-3 rounded-lg border shadow-md bg-background outline outline-1 outline-ring text-white">
                  <Markdown>{m.content}</Markdown>
                </div>
                <div className="w-10 h-10 flex items-center justify-center">
                  {m.role === 'user' && <span className="text-xl">🧑</span>}
                </div>
              </div>
            ))}
            {loading && !over && (
              <div className="text-muted-foreground text-center">
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {!over && (
          <div className="mt-4 flex items-end gap-2 bg-muted p-2 rounded-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Your answer…"
              disabled={!started}
              className="flex-1 p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground resize-none overflow-hidden disabled:opacity-50"
              style={{ whiteSpace: 'pre-wrap' }} // Preserve whitespace
            />
            <button
              onClick={handleSend}
              disabled={!started}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-foreground text-2xl ${
                started
                  ? 'bg-primary hover:bg-primary/90'
                  : 'bg-muted cursor-not-allowed opacity-50'
              }`}
            >
              ↑
            </button>
          </div>
        )}
      </div>

      {/* ---------------- RIGHT: TABS ---------------- */}
      <div className="w-1/2 flex flex-col h-screen border-l" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center p-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {(['code', 'camera', 'screenpipe'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: activeTab === t ? 'var(--accent)' : 'transparent',
                color: activeTab === t ? 'var(--accent-foreground)' : 'inherit',
                borderRadius: 'var(--radius-sm)',
              }}
              className="px-4 py-2 mr-2 font-medium transition-colors"
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          {/* -------- Code tab -------- */}
          <div
            className={`${activeTab === 'code' ? 'block' : 'hidden'} w-full h-full`}
          >
            <CodeEditor />
          </div>

          {/* -------- Camera tab (always mounted) -------- */}
          <div
            className={`absolute inset-0 items-center justify-center ${
              activeTab === 'camera'
                ? 'flex'
                : 'flex opacity-0 pointer-events-none'
            }`}
          >
            <CameraRecorder
              active={started && !over}
              interviewId={interviewId}
              onPermissionChange={setCameraEnabled}
            />
          </div>

          {/* -------- Screenpipe tab (always mounted) -------- */}
          <div
            className={`absolute inset-0 items-center justify-center ${
              activeTab === 'screenpipe'
                ? 'flex'
                : 'flex opacity-0 pointer-events-none'
            }`}
          >
            {probeOver && !screenpipeReady ? (
              <div className="text-center" style={{ color: 'var(--destructive)' }}>
                Screenpipe not found. Monitoring disabled.
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
                {renderBadge()}
                <div className="text-lg font-semibold">
                  Violation Count: {violations.length}
                </div>
                {violations.length > 0 && (
                  <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <h3 className="font-bold mb-2">Violation History:</h3>
                    {violations.map((v, i) => (
                      <div key={i} className="mb-1">
                        {new Date(v.timestamp).toLocaleString()} - {v.website}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Avatar ---------------- */}
      <div className="fixed bottom-6 right-6 w-[300px] h-[300px] z-50">
        <TalkingHeadComponent text={speakableText} gender="woman" />
      </div>
    </div>
  );
}