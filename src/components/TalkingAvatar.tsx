'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type TalkingHeadProps = {
  text: string;
  gender: string;
  onLoad?: () => void;
};

declare global {
  interface Window {
    TalkingHead?: any;
    talkingHeadLoaded?: boolean;
    talkingHeadError?: any;
  }
}

// --- Hook: dynamically load the TalkingHead library ---
function useTalkingHeadLoader() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || window.TalkingHead) {
      setStatus('loaded');
      loadedRef.current = true;
      return;
    }

    loadedRef.current = true;
    setStatus('loading');

    // 1) Inject importmap if needed
    if (!document.querySelector('script[type="importmap"]')) {
      const importMap = document.createElement('script');
      importMap.type = 'importmap';
      importMap.textContent = JSON.stringify({
        imports: {
          three: 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
          'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/',
          'three/addons/controls/OrbitControls.js':
            'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js',
        },
      });
      document.head.appendChild(importMap);
    }

    // 2) Load the TalkingHead module
    const loader = document.createElement('script');
    loader.type = 'module';
    loader.id = 'talking-head-loader';
    loader.textContent = `
      import { TalkingHead } from "https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs";
      window.TalkingHead = TalkingHead;
      window.talkingHeadLoaded = true;
    `;
    loader.onerror = (e) => {
      window.talkingHeadError = e;
      setStatus('error');
      setError('Failed to load TalkingHead library.');
    };
    loader.onload = () => setStatus('loaded');

    document.head.appendChild(loader);

    return () => {
      // no cleanup needed for script tags
    };
  }, []);

  return { status, error };
}

// --- Component ---
export default function TalkingHeadComponent({ text, gender, onLoad }: TalkingHeadProps) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<any>(null);
  const lastTextRef = useRef<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('Starting...');
  const [isReady, setIsReady] = useState(false);

  const { status: libStatus, error: libError } = useTalkingHeadLoader();

  // Initialize TalkingHead once the library is loaded
  useEffect(() => {
    if (libStatus !== 'loaded' || !avatarRef.current || headRef.current) {
      if (libStatus === 'error') setLoadingMessage(libError!);
      return;
    }

    let attempts = 0;
    const MAX = 50;
    const interval = setInterval(() => {
      attempts++;
      const TH = window.TalkingHead;
      if (!TH) {
        if (attempts >= MAX) {
          clearInterval(interval);
          setLoadingMessage('Unable to initialize avatar.');
        } else {
          setLoadingMessage(`Waiting for TalkingHead… (${attempts}/${MAX})`);
        }
        return;
      }

      clearInterval(interval);
      setLoadingMessage('Initializing avatar…');

      // Create instance
      try {
        const instance = new TH(avatarRef.current!, {
          ttsEndpoint: '/api/tts',
          ttsApikey: '',
          lipsyncModules: ['en'],
          cameraView: 'upper',
        });
        headRef.current = instance;
        loadModel(instance);
      } catch (err: any) {
        setLoadingMessage(`Initialization error: ${err.message}`);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [libStatus, libError]);

  // Load the GLB model and show avatar
  const loadModel = useCallback(
    (instance: any) => {
      const url = `/models/${gender}.glb`;

      fetch(url, { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) throw new Error(`Model not found (${res.status})`);
          return instance.showAvatar(
            {
              url,
              body: 'F',
              avatarMood: 'neutral',
              ttsLang: 'en-GB',
              ttsVoice: 'en-GB-Standard-A',
              lipsyncLang: 'en',
              ttsRate: 1.15,
              ttsVolume: 16,
            },
            (ev: ProgressEvent) => {
              if (ev.lengthComputable) {
                const pct = Math.round((ev.loaded / ev.total) * 100);
                setLoadingMessage(`Loading avatar: ${pct}%`);
              }
            }
          );
        })
        .then(() => {
          setLoadingMessage('');
          setIsReady(true);
          onLoad?.();
          // speak initial text
          if (text) instance.speakText(text);
        })
        .catch((err: any) => {
          setLoadingMessage(`Error loading model: ${err.message}`);
        });
    },
    [gender, onLoad, text]
  );

  // Pause/resume on tab visibility change
  useEffect(() => {
    const onVis = () => {
      const inst = headRef.current;
      if (!inst) return;
      document.visibilityState === 'visible' ? inst.start() : inst.stop();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      headRef.current?.stop();
      headRef.current = null;
    };
  }, []);

  // React to text changes
  useEffect(() => {
    if (isReady && text && text !== lastTextRef.current) {
      headRef.current!.speakText(text);
      lastTextRef.current = text;
    }
  }, [text, isReady]);

  return (
    <div className="text-white w-full h-full max-w-3xl mx-auto relative">
      <div ref={avatarRef} className="w-full h-full" />
      {loadingMessage}
    </div>
  );
}
