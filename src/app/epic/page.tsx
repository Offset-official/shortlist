"use client"
import React, { useEffect, useRef, useState } from 'react';
import { TalkingHead } from "@met4citizen/talkinghead";

const TalkingHeadApp = () => {
  const avatarRef = useRef(null);
  const [head, setHead] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [text, setText] = useState("Hi there. How are you? I'm fine.");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let headInstance: TalkingHead | null = null;

    const initTalkingHead = async () => {
      // Instantiate the class
      // NOTE: Never put your API key in a client-side code unless you know
      //       that you are the only one to have access to that code!
      headInstance = new TalkingHead(avatarRef.current, {
        ttsEndpoint: "https://eu-texttospeech.googleapis.com/v1beta1/text:synthesize",
        ttsApikey: "put-your-own-Google-TTS-API-key-here", // <- Change this
        lipsyncModules: ["en", "fi"],
        cameraView: "upper"
      });

      setHead(headInstance);

      try {
        // Load and show the avatar
        await headInstance.showAvatar({
          url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
          body: 'F',
          avatarMood: 'neutral',
          ttsLang: "en-GB",
          ttsVoice: "en-GB-Standard-A",
          lipsyncLang: 'en'
        }, (ev: { lengthComputable: any; loaded: number; total: number; }) => {
          if (ev.lengthComputable) {
            let val = Math.min(100, Math.round(ev.loaded / ev.total * 100));
            setLoadingStatus(`Loading ${val}%`);
          }
        });
        
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setLoadingStatus(error.toString());
      }
    };

    if (avatarRef.current) {
      initTalkingHead();
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (headInstance) {
        if (document.visibilityState === "visible") {
          headInstance.start();
        } else {
          headInstance.stop();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (headInstance) {
        headInstance.stop();
      }
    };
  }, []);

  const handleSpeak = () => {
    try {
      if (head && text) {
        head.speakText(text);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      maxWidth: '800px', 
      margin: 'auto', 
      position: 'relative', 
      backgroundColor: '#202020', 
      color: 'white' 
    }}>
      <div 
        ref={avatarRef} 
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      <div style={{ 
        display: 'block', 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        right: '10px', 
        height: '50px' 
      }}>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          style={{ 
            position: 'absolute', 
            width: 'calc(100% - 110px)', 
            height: '100%', 
            top: 0, 
            left: 0, 
            bottom: 0, 
            right: '110px', 
            fontFamily: 'Arial', 
            fontSize: '20px' 
          }} 
        />
        <button 
          onClick={handleSpeak}
          style={{ 
            display: 'block', 
            position: 'absolute', 
            top: 0, 
            bottom: 0, 
            right: 0, 
            height: '100%', 
            width: '100px', 
            fontFamily: 'Arial', 
            fontSize: '20px' 
          }}
        >
          Speak
        </button>
      </div>
      
      {isLoading && (
        <div style={{ 
          display: 'block', 
          position: 'absolute', 
          bottom: '10px', 
          left: '10px', 
          right: '10px', 
          height: '50px', 
          fontFamily: 'Arial', 
          fontSize: '20px' 
        }}>
          {loadingStatus}
        </div>
      )}
    </div>
  );
};

export default TalkingHeadApp;