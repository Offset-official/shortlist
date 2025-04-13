"use client";

import { useState, useEffect, useRef } from "react";
import { PlayCircle, Square } from "lucide-react";

export default function CameraRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState("waiting");
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
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

    // Cleanup: stop tracks if component unmounts
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
    <div className="w-72 bg-muted rounded-lg shadow-lg p-4 relative flex flex-col items-center justify-center">
      {/* Permission Status Handling */}
      {permissionStatus === "waiting" && (
        <p className="text-sm">Waiting for permission...</p>
      )}
      {permissionStatus === "denied" && (
        <p className="text-sm text-red-500">Permission not given</p>
      )}

      {permissionStatus === "granted" && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-48 rounded-lg bg-black"
          />
          {/* Record Button */}
          <button
            onClick={toggleRecording}
            className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full p-2 text-white
              ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
          </button>
        </>
      )}
    </div>
  );
}
