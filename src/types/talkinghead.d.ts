// types/talkinghead.d.ts

declare module 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.4/modules/talkinghead.mjs' {
    export class TalkingHead {
      constructor(container: HTMLElement, options: {
        ttsEndpoint: string;
        ttsApikey: string;
        lipsyncModules?: string[];
        cameraView?: 'upper' | 'full';
      });
  
      showAvatar(
        options: {
          url: string;
          body: 'M' | 'F';
          avatarMood: 'neutral' | string;
          ttsLang?: string;
          ttsVoice?: string;
          lipsyncLang?: string;
          ttsRate?: number;
          ttsVolume?: number;
        },
        progressCallback?: (ev: ProgressEvent) => void
      ): Promise<void>;
  
      speakText(text: string, callback?: () => void): void;
      start(): void;
      stop(): void;
      destroy(): void;
    }
  }