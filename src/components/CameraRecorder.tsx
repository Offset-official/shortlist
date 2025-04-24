"use client";

import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { getFacingDirection } from "../utils/faceUtils";
import { getPoseStatus } from "../utils/poseUtils";
import { Landmark } from "../utils/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface Props {
  /** when true, begin posting diagnostics to /api/diagnostics */
  active: boolean;
  interviewId: string;
  /** callback to notify parent of camera permission status */
  onPermissionChange?: (granted: boolean) => void;
}

export default function CameraRecorder({ active, interviewId, onPermissionChange }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"waiting"|"granted"|"denied">("waiting");
  const [faceStatus, setFaceStatus] = useState("No Face Detected");
  const [poseStatus, setPoseStatus] = useState("No Pose Detected");

  const videoRef = useRef<HTMLVideoElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker|null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker|null>(null);

  // throttle detection to ~2 fps
  const lastDetectTime = useRef(0);
  const THROTTLE_MS = 500;

  // 1) getUserMedia with resolution & frameRate constraints
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, frameRate: 15 },
    })
    .then(stream => {
      setStream(stream);
      setPermissionStatus("granted");
      if (onPermissionChange) onPermissionChange(true);
    })
    .catch(() => {
      setPermissionStatus("denied");
      if (onPermissionChange) onPermissionChange(false);
    });
  }, [onPermissionChange]);

  // 2) sync stream → video element & cleanup
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  // 3) init Mediapipe models, GPU first then CPU fallback
  useEffect(() => {
    (async () => {
      const resolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      // Helper to create with fallback
      async function createLM<T>(ctor: any, opts: any): Promise<T> {
        try {
          return await ctor.createFromOptions(resolver, { ...opts, baseOptions: { ...opts.baseOptions, delegate: "GPU" } });
        } catch {
          return await ctor.createFromOptions(resolver, { ...opts, baseOptions: { ...opts.baseOptions, delegate: "CPU" } });
        }
      }

      faceLandmarkerRef.current = await createLM<FaceLandmarker>(FaceLandmarker, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      poseLandmarkerRef.current = await createLM<PoseLandmarker>(PoseLandmarker, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    })();
  }, []);

  // 4) detection loop with throttle
  useEffect(() => {
    let rafId: number;

    const detect = () => {
      const now = performance.now();
      if (now - lastDetectTime.current >= THROTTLE_MS) {
        lastDetectTime.current = now;
        const vid = videoRef.current;
        if (vid && vid.readyState >= 2) {
          // Face
          const f = faceLandmarkerRef.current;
          if (f) {
            const { faceLandmarks } = f.detectForVideo(vid, now);
            setFaceStatus(faceLandmarks?.[0]
              ? getFacingDirection(faceLandmarks[0] as Landmark[])
              : "No Face Detected"
            );
          }
          // Pose
          const p = poseLandmarkerRef.current;
          if (p) {
            const { landmarks } = p.detectForVideo(vid, now);
            setPoseStatus(landmarks?.[0]
              ? getPoseStatus(landmarks[0] as Landmark[])
              : "No Pose Detected"
            );
          }
        }
      }
      rafId = requestAnimationFrame(detect);
    };

    rafId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 5) POST diagnostics at 1 Hz
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          faceData: faceStatus,
          poseData: poseStatus,
          cameraImage: null,
          screenpipeData: null,
        }),
      }).catch(console.error);
    }, 1000);
    return () => clearInterval(iv);
  }, [active, faceStatus, poseStatus, interviewId]);

  

  return (
    <div className="w-full flex justify-center">
      <div className="scale-[0.7] origin-top w-full max-w-4xl bg-muted rounded-lg shadow-lg p-4 flex flex-col items-center">
        {permissionStatus === "waiting" && <p className="text-sm">Waiting for permission…</p>}
        {permissionStatus === "denied" && <p className="text-sm text-red-500">Permission not given</p>}
        {permissionStatus === "granted" && (
          <>
            <div className="w-full relative h-8 mb-4">
              <Badge className={`absolute left-1/4 -translate-x-1/2 text-xl text-white ${faceStatus === "Forward" ? "bg-green-500" : "bg-red-500"}`}>
                {faceStatus}
              </Badge>
              <Badge className={`absolute left-3/4 -translate-x-1/2 text-xl text-white ${poseStatus === "Good Pose" ? "bg-green-500" : "bg-red-500"}`}>
                {poseStatus}
              </Badge>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-[480px] rounded-lg bg-black" />
          </>
        )}
      </div>
    </div>
  );
}
