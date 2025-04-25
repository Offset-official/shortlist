'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Markdown from 'react-markdown';
import CodeEditor from '@/components/CodeEditor';
import CameraRecorder from '@/components/CameraRecorder';
import toast from 'react-hot-toast';
import { pipe } from '@screenpipe/browser';
import { Badge } from '@/components/ui/badge';
import { set } from 'date-fns';

/* ----------------------------------------------------------- */
/* Helper: strip <SPEAKABLE> … </SPEAKABLE>                    */
/* ----------------------------------------------------------- */
function extractSpeakableContent(content: string) {
  const reg = /<SPEAKABLE>([\s\S]*?)<\/SPEAKABLE>/g;
  const matches = [...content.matchAll(reg)];
  const speakableText = matches.map((m) => m[1]).join(' ');
  const cleanedContent = content.replace(/<\/?SPEAKABLE>/g, '');
  return { speakableText, cleanedContent };
}

/* ----------------------------------------------------------- */
/* Helper: detect and wrap code in Markdown code blocks         */
/* ----------------------------------------------------------- */
function wrapCodeInMarkdown(input: string): string {
  const isCode = input.includes('\n') || input.match(/^\s{2,}/m) || input.match(/\b(function|class|const|let|var|import|export)\b/);
  if (isCode) {
    return `\`\`\`tsx\n${input}\n\`\`\``;
  }
  return input;
}

/* ----------------------------------------------------------- */
/* Lazy-loader helpers for TalkingHead                         */
/* ----------------------------------------------------------- */
async function ensureImportMap() {
  if (document.querySelector('script[type="importmap"]')) return;
  const s = document.createElement('script');
  s.type = 'importmap';
  s.textContent = JSON.stringify({
    imports: {
      three: 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
      'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/',
      'three/addons/controls/OrbitControls.js':
        'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js',
    },
  });
  document.head.appendChild(s);
}

async function getTalkingHead() {
  if ((window as any).TalkingHead) return (window as any).TalkingHead;
  await ensureImportMap();
  const mod = await import(
    /* webpackIgnore: true */
    'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs'
  );
  (window as any).TalkingHead = mod.TalkingHead;
  return mod.TalkingHead;
}

/* ----------------------------------------------------------- */
/* TalkingHead Component                                       */
/* ----------------------------------------------------------- */
type TalkingHeadProps = { text: string; gender: 'man' | 'woman'; onLoad?: () => void };

function TalkingHeadComponent({ text, gender, onLoad }: TalkingHeadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const lastTextRef = useRef<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [msg, setMsg] = useState('Preparing avatar engine…');
  const instanceId = useRef(`${Date.now()}-${Math.random()}`).current;

  // Log mount/unmount
  useEffect(() => {
    console.log(`[TalkingHeadComponent Mount] Instance: ${instanceId}`);
    return () => {
      console.log(`[TalkingHeadComponent Unmount] Instance: ${instanceId}`);
      if (headRef.current) {
        console.log(`[Unmount Cleanup] Stopping and destroying TalkingHead for instance: ${instanceId}`);
        headRef.current.stop?.();
        headRef.current.destroy?.();
        headRef.current = null;
      }
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) {
          console.log(`[Unmount Cleanup] Removing canvas for instance: ${instanceId}`);
          canvas.remove();
        }
      }
    };
  }, [instanceId]);

  // Initialize TalkingHead
  useEffect(() => {
    console.log(`[Init Effect] Starting initialization for instance: ${instanceId}`);
    let cancelled = false;

    async function bootstrap() {
      console.log(`[Bootstrap] Loading TalkingHead library for instance: ${instanceId}`);
      const TH = await getTalkingHead();
      if (cancelled) {
        console.log(`[Bootstrap] Cancelled before initialization for instance: ${instanceId}`);
        return;
      }

      const container = containerRef.current;
      if (!container) {
        console.error(`[Bootstrap] Container ref is null for instance: ${instanceId}`);
        setStatus('error');
        setMsg('Container not found');
        return;
      }

      setMsg('Initialising avatar…');
      container.style.width = '300px';
      container.style.height = '300px';
      container.style.position = 'relative';
      container.style.overflow = 'visible';

      try {
        console.log(`[Bootstrap] Creating TalkingHead instance for instance: ${instanceId}`);
        headRef.current = new TH(container, {
          ttsEndpoint: '/api/tts',
          ttsApikey: '',
          lipsyncModules: ['en'],
          cameraView: 'upper',
        });

        console.log(`[Bootstrap] Loading avatar model for instance: ${instanceId}`);
        await headRef.current.showAvatar(
          {
            url: `/assets/models/${gender}.glb`,
            body: gender === 'woman' ? 'F' : 'M',
            avatarMood: 'neutral',
            ttsLang: 'en-GB',
            ttsVoice: 'en-GB-Standard-A',
            lipsyncLang: 'en',
            ttsRate: 1.15,
            ttsVolume: 16,
          },
          (ev: ProgressEvent) => {
            if (ev.lengthComputable) {
              const percent = Math.round((ev.loaded / ev.total) * 100);
              setMsg(`Downloading avatar… ${percent}%`);
              console.log(`[Bootstrap] Avatar download progress: ${percent}% for instance: ${instanceId}`);
            }
          }
        );

        if (cancelled) {
          console.log(`[Bootstrap] Cancelled after avatar load for instance: ${instanceId}`);
          return;
        }

        const canvas = container.querySelector('canvas');
        if (canvas) {
          canvas.style.width = '300px';
          canvas.style.height = '300px';
          canvas.style.position = 'absolute';
          canvas.style.top = '0';
          canvas.style.left = '0';
          canvas.style.zIndex = '10';
          console.log(`[Bootstrap] Canvas initialized with dimensions: ${canvas.width}x${canvas.height} for instance: ${instanceId}`);
        } else {
          console.warn(`[Bootstrap] No canvas found in container for instance: ${instanceId}`);
          setStatus('error');
          setMsg('Avatar loaded but canvas not found');
          return;
        }

        console.log(`[Bootstrap] Avatar ready for instance: ${instanceId}`);
        setStatus('ready');
        setMsg('');
        headRef.current.start?.();
        onLoad?.();
      } catch (e) {
        console.error(`[Bootstrap] Error during initialization for instance: ${instanceId}:`, e);
        setStatus('error');
        setMsg('Failed to load avatar');
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      console.log(`[Init Effect Cleanup] Cleaning up for instance: ${instanceId}`);
      if (headRef.current) {
        headRef.current.stop?.();
        headRef.current.destroy?.();
        headRef.current = null;
      }
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) canvas.remove();
      }
    };
  }, [gender, onLoad, instanceId]);

  // Speak text when it changes
  useEffect(() => {
    console.log(`[Text Effect] Text received: "${text}", Status: ${status}, Last Text: "${lastTextRef.current}" for instance: ${instanceId}`);
    if (!text) {
      console.log(`[Text Effect] Text is empty, skipping for instance: ${instanceId}`);
      return;
    }
    if (text === lastTextRef.current) {
      console.log(`[Text Effect] Text unchanged, skipping for instance: ${instanceId}`);
      return;
    }
    if (status !== 'ready') {
      console.log(`[Text Effect] Avatar not ready (status: ${status}), skipping for instance: ${instanceId}`);
      return;
    }
    if (!headRef.current) {
      console.warn(`[Text Effect] headRef is null, cannot speak for instance: ${instanceId}`);
      return;
    }

    console.log(`[Text Effect] Speaking text: "${text}" for instance: ${instanceId}`);
    try {
      headRef.current.speakText(text, () => {
        console.log(`[Text Effect] Completed speaking: "${text}" for instance: ${instanceId}`);
        lastTextRef.current = text;
      });
    } catch (e) {
      console.error(`[Text Effect] Error speaking text: ${e} for instance: ${instanceId}`);
      lastTextRef.current = text;
    }
  }, [text, status, instanceId]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log(`[Visibility] State: ${document.visibilityState} for instance: ${instanceId}`);
      if (headRef.current) {
        if (document.visibilityState === 'visible') {
          console.log(`[Visibility] Resuming TalkingHead for instance: ${instanceId}`);
          headRef.current.start?.();
        } else {
          console.log(`[Visibility] Pausing TalkingHead for instance: ${instanceId}`);
          headRef.current.stop?.();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      console.log(`[Visibility Cleanup] Removing visibility listener for instance: ${instanceId}`);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [instanceId]);

  return (
    <div className="relative w-full h-full text-foreground">
      <div
        ref={containerRef}
        className="w-[300px] h-[300px] relative overflow-visible bg-transparent"
      />
      {msg && (
        <p className="absolute inset-x-0 bottom-[-2rem] text-center text-sm text-muted-foreground">
          {msg}
        </p>
      )}
    </div>
  );
}

const MemoizedTalkingHeadComponent = memo(TalkingHeadComponent);

/* ------------------------------------------------------------ */
/* Screenpipe Types                                            */
/* ------------------------------------------------------------ */
type Status = 'retry' | 'init' | 'ready' | 'error';

function InterviewContent() {
  const params = useSearchParams();
  const interviewId = params?.get('id') || '';
  const mock = params?.get('mock') === 'true';

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [speakableText, setSpeakableText] = useState('');
  const [avatarReady, setAvatarReady] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const cameraRecorderRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'camera' | 'screenpipe'>('code');

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenpipeReady, setScreenpipeReady] = useState(false);
  const [screenpipeRequired, setScreenpipeRequired] = useState(false);
  const [fetchedReqs, setFetchedReqs] = useState(false);

  const [probeOver, setProbeOver] = useState(false);
  const [status, setStatus] = useState<Status>('retry');
  const [everConnected, setEverConnected] = useState(false);
  const [initCountdown, setInitCountdown] = useState(5);
  const [bad, setBad] = useState(false);

  const [violations, setViolations] = useState<{
    timestamp: string;
    website: string;
  }[]>([]);
  const [forbiddenWebsites] = useState([
    { name: 'google', pattern: 'google' },
    { name: 'chatgpt', pattern: 'chatgpt' },
    { name: 'gemini', pattern: 'gemini' },
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

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const changeStatus = (s: Status) => {
    console.log(`[InterviewPage] Changing Screenpipe status to: ${s}`);
    setStatus(s);
    setScreenpipeReady(s === 'ready');
  };

  useEffect(() => {
    if (probeOver) return;
    const t = setTimeout(() => {
      console.log('[InterviewPage] Probe timeout reached, setting probeOver to true');
      setProbeOver(true);
    }, 5_000);
    return () => clearTimeout(t);
  }, [probeOver]);

  const fetchSystemPromptAndReqs = async () => {
    console.log(`[InterviewPage] Fetching system prompt and requirements for interviewId: ${interviewId}, mock: ${mock}`);
    const r = await fetch(`/api/getInterviewSystemPrompt?id=${interviewId}&mock=${mock}`);
    const { systemPrompt, screenpipeRequired_ } = await r.json();
    setScreenpipeRequired(screenpipeRequired_);
    setFetchedReqs(true);
    return systemPrompt as string;
  };

  const saveHistory = async (hist: any[]) => {
    if (!interviewId) return;
    console.log('[InterviewPage] Saving chat history');
    await fetch('/api/interview/update_chat_history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewId, chatHistory: hist }),
    });
  };

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

    if (!avatarReady) {
      toast.error('Please wait for the avatar to finish loading.');
      return;
    }

    if (!interviewId) {
      router.push('/interview');
      return;
    }

    console.log('[InterviewPage] Starting interview');
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

    // Reset violations and bad state when interview starts
    setViolations([]);
    setBad(false);

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
      console.log(`[InterviewPage] Setting initial speakableText: "${speakableText || cleanedContent}"`);
      setSpeakableText(speakableText || cleanedContent || 'Welcome to the interview!');
      setMessages([{ role: 'assistant', content: cleanedContent }]);
      await saveHistory([{ role: 'assistant', content: cleanedContent }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || over) return;
    const formattedInput = wrapCodeInMarkdown(input);
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
      console.log(`[InterviewPage] Setting speakableText: "${speakableText || cleanedContent}"`);
      setSpeakableText(speakableText || cleanedContent || 'Please continue.');
      const final = [...next, { role: 'assistant', content: cleanedContent }];
      setMessages(final);
      await saveHistory(final);
      if (data.isInterviewOver) setOver(true);
    } finally {
      setLoading(false);
    }
  };

  // Start camera diagnostics when interview starts
  useEffect(() => {
    if (started && cameraRecorderRef.current) {
      console.log('[InterviewPage] Triggering CameraRecorder diagnostics');
      cameraRecorderRef.current.startDiagnostics?.();
    }
  }, [started]);

  useEffect(() => {
    if (started) return;
    fetchSystemPromptAndReqs().then((sp) =>
      sessionStorage.setItem('InterviewSystemPrompt', sp)
    );
  }, [started]);

  // Screenpipe connection probing
  useEffect(() => {
    if (status !== 'retry') return;

    const probe = async () => {
      try {
        console.log('[InterviewPage] Probing Screenpipe connection');
        const res = await pipe.queryScreenpipe({
          startTime: new Date(Date.now() - 10_000).toISOString(),
          limit: 10,
          contentType: 'ocr',
        });

        console.log('[InterviewPage] Screenpipe probe successful');
        setEverConnected(true);
        clearInterval(retryInterval.current);
        clearTimeout(retryTimer.current);
        changeStatus('ready');
      } catch (err: any) {
        const http = err?.response?.status ?? err?.status;
        console.warn(`[InterviewPage] Screenpipe probe failed: ${err}`);
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
        console.log('[InterviewPage] Screenpipe retry timeout, setting status to error');
        changeStatus('error');
      }
    }, 5_000);

    return () => {
      clearInterval(retryInterval.current);
      clearTimeout(retryTimer.current);
    };
  }, [status]);

  // Screenpipe initialization countdown
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

  // Combined diagnostics for CameraRecorder and Screenpipe
  useEffect(() => {
    // Run diagnostics if Screenpipe is enabled, even before interview starts
    if (!screenpipeReady) {
      console.log('[InterviewPage] Diagnostics not started: screenpipeReady=false');
      return;
    }

    const poll = async () => {
      const diagnosticsData: any = {
        interviewId,
        poseData: null,
        faceData: null,
        cameraImage: null,
        screenpipeData: null,
        violations: started ? violations : [], // Only include violations after interview starts
      };

      // Screenpipe diagnostics
      try {
        console.log('[InterviewPage] Querying Screenpipe for diagnostics');
        const res = await pipe.queryScreenpipe({
          startTime: new Date(Date.now() - 10_000).toISOString(),
          limit: 10,
          contentType: 'ocr',
        });
        diagnosticsData.screenpipeData = res;
        if (started) {
          // Only analyze and store violations after interview starts
          analyse(res);
        }
        console.log('[InterviewPage] Screenpipe diagnostics collected');
      } catch (err) {
        console.warn('[InterviewPage] Screenpipe diagnostics failed, will retry:', err);
      }

      // Camera diagnostics (only when interview is active)
      if (started && cameraRecorderRef.current) {
        diagnosticsData.faceData = cameraRecorderRef.current.faceStatus || 'Unknown';
        diagnosticsData.poseData = cameraRecorderRef.current.poseStatus || 'Unknown';
        console.log('[InterviewPage] Camera diagnostics included from CameraRecorder');
      }

      // Post combined diagnostics
      console.log('[InterviewPage] Posting combined diagnostics');
      fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosticsData),
      }).catch((err) => console.error('[InterviewPage] Diagnostics POST failed:', err));
    };

    // Run immediately and then every 10 seconds
    poll();
    pollInterval.current = setInterval(poll, 10_000);
    return () => clearInterval(pollInterval.current);
  }, [status, started]);

  /* Screenpipe: analysis of OCR results */
  function analyse(res: any) {
    const newViolations: { timestamp: string; website: string }[] = [];
  
    res.data?.forEach((it: any) => {
      if (it.type !== 'OCR') return;
      const w = it.content.windowName?.toLowerCase() || '';
      const timestamp = new Date().toISOString();
  
      if (!w.includes('connecting talent with opportunities')) {
        console.log(`[InterviewPage] Suspicious activity detected: Interview tab not active at ${timestamp}`);
        newViolations.push({
          timestamp,
          website: 'Interview tab not active',
        });
      }
  
      forbiddenWebsites.forEach((website) => {
        if (w.includes(website.pattern)) {
          console.log(`[InterviewPage] Suspicious activity detected: ${website.name} at ${timestamp}`);
          newViolations.push({
            timestamp,
            website: website.name,
          });
        }
      });
    });
  
    if (newViolations.length > 0) {
      console.log('[InterviewPage] New violations detected:', newViolations);
      setViolations((prev) => [...prev, ...newViolations]);
      if (!bad) {
        console.log('[InterviewPage] Updating bad status to: true');
        setBad(true);
      }
    } else {
      if (bad) {
        console.log('[InterviewPage] Updating bad status to: false');
        setBad(false);
      }
    }
  }
  // console.log("screenpipe req", screenpipeRequired);
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

  const onLoad = useCallback(() => {
    console.log('[InterviewPage] Avatar loaded, setting avatarReady to true');
    setAvatarReady(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      <div className="w-1/2 flex flex-col h-screen p-4">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">
            {over ? 'Interview Complete' : 'Interview'}
          </h1>
        </header>

        {!started ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {probeOver && !screenpipeReady && (
              <div className="text-center" style={{ color: 'var(--destructive)' }}>
                {screenpipeRequired && "Screenpipe not found. Please start the Screenpipe back-end and refresh."}
              </div>
            )}
            <button
              onClick={handleStart}
              disabled={(screenpipeRequired && !screenpipeReady) || !avatarReady}
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-md)',
                opacity: (screenpipeRequired && !screenpipeReady) || !avatarReady ? 0.5 : 1,
                cursor: (screenpipeRequired && !screenpipeReady) || !avatarReady ? 'not-allowed' : 'pointer',
              }}
              className="px-6 py-3 font-semibold transition-colors"
            >
              {avatarReady ? 'Start Interview' : 'Avatar Loading'}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 chat-scroll">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 mx-4 ${
                  i === 0 ? 'mt-4' : ''
                }`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  {m.role === 'assistant' && <span className="text-xl">🤖</span>}
                </div>
                <div className="p-3 rounded-lg border shadow-md bg-background outline-ring text-white">
                  <Markdown>{m.content}</Markdown>
                </div>
                <div className="w-10 h-10 flex items-center justify-center">
                  {m.role === 'user' && <span className="text-xl">🧑</span>}
                </div>
              </div>
            ))}
            {loading && !over && (
              <div className="text-muted-foreground text-center">Thinking…</div>
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
              style={{ whiteSpace: 'pre-wrap' }}
            />
            <button
              onClick={handleSend}
              disabled={!started}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-foreground text-2xl ${
                started ? 'bg-primary hover:bg-primary/90' : 'bg-muted cursor-not-allowed opacity-50'
              }`}
            >
              ↑
            </button>
          </div>
        )}
      </div>

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
          <div className={`${activeTab === 'code' ? 'block' : 'hidden'} w-full h-full`}>
            <CodeEditor />
          </div>

          <div
            className={`absolute inset-0 items-center justify-center ${
              activeTab === 'camera' ? 'flex' : 'flex opacity-0 pointer-events-none'
            }`}
          >
            <CameraRecorder
              active={started && !over}
              interviewId={interviewId}
              onPermissionChange={setCameraEnabled}
            />
          </div>

          <div
  className={`absolute inset-0 items-center justify-center ${
    activeTab === 'screenpipe' ? 'flex' : 'flex opacity-0 pointer-events-none'
  }`}
>
  {probeOver && !screenpipeReady ? (
    <div className="text-center" style={{ color: 'var(--destructive)' }}>
      Screenpipe not found. Monitoring disabled.
    </div>
  ) : !started ? (
    <div className="text-center text-lg font-semibold">
      Start Interview to enable analytics
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
      {renderBadge()}
      <div className="text-lg font-semibold">Violation Count: {violations.length}</div>
      {violations.length > 0 && (
        <div
          style={{
            maxHeight: '200px', // Fixed height for scrollable area
            overflowY: 'auto', // Enable vertical scrollbar
            width: '100%', // Fit container width
            paddingRight: '8px', // Prevent content from touching scrollbar
            color: 'var(--muted-foreground)',
          }}
          className='px-15'
        >
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

      <div className="fixed bottom-6 right-6 w-[300px] h-[300px] z-50">
        <MemoizedTalkingHeadComponent
          key="talking-head"
          text={speakableText}
          gender="woman"
          onLoad={onLoad}
        />
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewContent />
    </Suspense>
  );
}