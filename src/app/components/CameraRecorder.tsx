"use client";

import { useState, useEffect, useRef } from "react";
import { PlayCircle, Square, ChevronRight, ChevronLeft } from "lucide-react";

export default function CameraRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState("waiting");
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        setPermissionStatus("granted");
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Webcam permission denied:", err);
        setPermissionStatus("denied");
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleRecording = () => {
    if (!stream) return;

    if (!isRecording) {
      try {
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        mediaRecorderRef.current = recorder;
        recordedChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          console.log("🎥 Recorded video blob:", blob);
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recording error:", err);
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`flex items-end transition-transform duration-300 ${
          isCameraVisible ? "translate-x-0" : "translate-x-[calc(100%_-_1.5rem)]"
        }`}
      >
        <div className="bg-muted p-4 rounded-lg shadow-lg w-72 relative">
          {permissionStatus === "waiting" && <p className="text-sm">Waiting for permission...</p>}
          {permissionStatus === "denied" && <p className="text-sm text-red-500">Permission not given</p>}
          {permissionStatus === "granted" && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 rounded-lg bg-black"
              />
              <button
                onClick={toggleRecording}
                className="mt-2 mx-auto flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-white p-2 rounded-lg"
              >
                {isRecording ? <Square className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>

        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => setIsCameraVisible((prev) => !prev)}
          className="ml-1 p-1 bg-muted rounded-full shadow border"
        >
          {isCameraVisible ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}