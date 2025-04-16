"use client";

import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Import our utility functions and types.
import { getFacingDirection } from "../utils/faceUtils";
import { getPoseStatus } from "../utils/poseUtils";
import { Landmark } from "../utils/types";
import { Badge } from "@/components/ui/badge";
export default function CameraRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionStatus, setPermissionStatus] = useState("waiting");
  const [faceStatus, setFaceStatus] = useState("No Face Detected");
  const [poseStatus, setPoseStatus] = useState("No Pose Detected");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  // Set up the webcam stream.
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
    // Cleanup: stop tracks if component unmounts.
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure the video element uses the stream.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Initialize the FaceLandmarker for face detection.
  useEffect(() => {
    async function initFaceLandmarker() {
      try {
        const resolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;
        console.log("FaceLandmarker initialized");
      } catch (error) {
        console.error("Error initializing faceLandmarker:", error);
      }
    }
    initFaceLandmarker();
  }, []);

  // Initialize the PoseLandmarker for pose detection.
  useEffect(() => {
    async function initPoseLandmarker() {
      try {
        const resolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const poseLandmarker = await PoseLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        poseLandmarkerRef.current = poseLandmarker;
        console.log("PoseLandmarker initialized");
      } catch (error) {
        console.error("Error initializing poseLandmarker:", error);
      }
    }
    initPoseLandmarker();
  }, []);

  // Run detection loop for both face and pose.
  useEffect(() => {
    let animationFrameId: number = 0;
    function detectFrame() {
      const videoEl = videoRef.current;
      if (!videoEl || videoEl.readyState < 2) {
        animationFrameId = requestAnimationFrame(detectFrame);
        return;
      }
      const timestamp = performance.now();

      // Face detection.
      if (faceLandmarkerRef.current) {
        try {
          const resultFace = faceLandmarkerRef.current.detectForVideo(videoEl, timestamp);
          if (resultFace && resultFace.faceLandmarks && resultFace.faceLandmarks.length > 0) {
            const landmarks = resultFace.faceLandmarks[0] as Landmark[];
            setFaceStatus(getFacingDirection(landmarks));
          } else {
            setFaceStatus("No Face Detected");
          }
        } catch (error) {
          console.error("Face detection error:", error);
        }
      }

      // Pose detection.
      if (poseLandmarkerRef.current) {
        try {
          const resultPose = poseLandmarkerRef.current.detectForVideo(videoEl, timestamp);
          if (resultPose && resultPose.landmarks && resultPose.landmarks.length > 0) {
            const poseLandmarks = resultPose.landmarks[0] as Landmark[];
            setPoseStatus(getPoseStatus(poseLandmarks));
          } else {
            setPoseStatus("No Pose Detected");
          }
        } catch (error) {
          console.error("Pose detection error:", error);
        }
      }

      animationFrameId = requestAnimationFrame(detectFrame);
    }
    animationFrameId = requestAnimationFrame(detectFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full flex justify-center">
    <div className="scale-[0.7] origin-top w-full max-w-4xl bg-muted rounded-lg shadow-lg p-4 flex flex-col items-center">
      {/* Display permission messages */}
      {permissionStatus === "waiting" && <p className="text-sm">Waiting for permission...</p>}
      {permissionStatus === "denied" && <p className="text-sm text-red-500">Permission not given</p>}
      
      {/* Only display the video and info if permission is granted */}
      {permissionStatus === "granted" && (
        <>
          {/* Face and Pose information displayed above the video */}
          <div className="w-full relative h-8 mb-4 ">
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


          {/* Larger video element */}
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
