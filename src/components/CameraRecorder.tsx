"use client";

import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { getFacingDirection } from "../utils/faceUtils";
import { getPoseStatus } from "../utils/poseUtils";
import { Landmark } from "../utils/types";
import { Badge } from "@/components/ui/badge";

export default function CameraRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"waiting" | "granted" | "denied">("waiting");
  const [faceStatus, setFaceStatus] = useState("No Face Detected");
  const [poseStatus, setPoseStatus] = useState("No Pose Detected");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  const latestFaceLandmarks = useRef<Landmark[] | null>(null);
  const latestPoseLandmarks = useRef<Landmark[] | null>(null);

  // Refs to mirror the latest label values
  const faceStatusRef = useRef<string>(faceStatus);
  const poseStatusRef = useRef<string>(poseStatus);

  // Keep refs in sync with state
  useEffect(() => {
    faceStatusRef.current = faceStatus;
  }, [faceStatus]);

  useEffect(() => {
    poseStatusRef.current = poseStatus;
  }, [poseStatus]);

  // 1) getUserMedia
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        setPermissionStatus("granted");
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      })
      .catch(() => setPermissionStatus("denied"));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // 2) sync stream → video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // 3) init Mediapipe models
  useEffect(() => {
    (async () => {
      const resolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "CPU",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    })();
  }, []);

  // 4) detection loop
  useEffect(() => {
    let raf: number;

    const detect = () => {
      const vid = videoRef.current;
      if (vid && vid.readyState >= 2) {
        const ts = performance.now();

        // face
        if (faceLandmarkerRef.current) {
          const res = faceLandmarkerRef.current.detectForVideo(vid, ts);
          if (res.faceLandmarks?.[0]) {
            latestFaceLandmarks.current = res.faceLandmarks[0] as Landmark[];
            setFaceStatus(getFacingDirection(latestFaceLandmarks.current));
          } else {
            latestFaceLandmarks.current = null;
            setFaceStatus("No Face Detected");
          }
        }

        // pose
        if (poseLandmarkerRef.current) {
          const res = poseLandmarkerRef.current.detectForVideo(vid, ts);
          if (res.landmarks?.[0]) {
            latestPoseLandmarks.current = res.landmarks[0] as Landmark[];
            setPoseStatus(getPoseStatus(latestPoseLandmarks.current));
          } else {
            latestPoseLandmarks.current = null;
            setPoseStatus("No Pose Detected");
          }
        }
      }

      raf = requestAnimationFrame(detect);
    };

    raf = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 5) POST diagnostics (labels only) at 2 Hz, reading from refs
  useEffect(() => {
    const iv = setInterval(() => {
      fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poseData: poseStatusRef.current,
          faceData: faceStatusRef.current,
          cameraImage: null,
          screenpipeData: null,
        }),
      }).catch(console.error);
    }, 500);

    return () => clearInterval(iv);
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div className="scale-[0.7] origin-top w-full max-w-4xl bg-muted rounded-lg shadow-lg p-4 flex flex-col items-center">
        {permissionStatus === "waiting" && (
          <p className="text-sm">Waiting for permission…</p>
        )}
        {permissionStatus === "denied" && (
          <p className="text-sm text-red-500">Permission not given</p>
        )}
        {permissionStatus === "granted" && (
          <>
            <div className="w-full relative h-8 mb-4">
              <Badge
                className={`absolute left-1/4 -translate-x-1/2 text-white text-xl ${
                  faceStatus === "Forward" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {faceStatus}
              </Badge>
              <Badge
                className={`absolute left-3/4 -translate-x-1/2 text-white text-xl ${
                  poseStatus === "Good Pose" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {poseStatus}
              </Badge>
            </div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[480px] rounded-lg bg-black"
            />
          </>
        )}
      </div>
    </div>
  );
}
