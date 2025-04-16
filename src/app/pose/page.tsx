"use client";

import React, { useRef, useState, useEffect } from "react";
import CameraRecorder, { CameraRecorderHandle } from "@/components/CameraRecorder";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// The isBadPosture function checks the distance between the head and the midpoint of the shoulders
export const isBadPosture = (landmarks: any[]): boolean => {
  const head = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (!head || !leftShoulder || !rightShoulder) return false;

  // Calculate the midpoint between the shoulders.
  const midShoulders = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };

  // Compute the Euclidean distance between the head and the shoulder midpoint.
  const dx = head.x - midShoulders.x;
  const dy = head.y - midShoulders.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Return true if the distance is less than 0.3, indicating a "bad" posture.
  return distance < 0.3;
};

const PoseEvaluator: React.FC = () => {
  // Ref for the CameraRecorder (provides access to the underlying video element)
  const cameraRef = useRef<CameraRecorderHandle>(null);
  // Ref for our pose landmarker instance
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  // State for storing the current evaluation result (e.g. "Good Posture", "Bad Posture")
  const [poseResult, setPoseResult] = useState<string>("No Pose Detected");
  // Keeps track of our running mode ("IMAGE" initially, then "VIDEO")
  const runningMode = useRef<"IMAGE" | "VIDEO">("IMAGE");
  // Stores the last processed video's currentTime to avoid redundant processing
  const lastVideoTime = useRef<number>(-1);
  // Reference for the requestAnimationFrame id so we can cancel it on cleanup
  const animationFrameId = useRef<number>(0);

  // ----------------------------------------------------------------------
  // Initialize the PoseLandmarker
  // ----------------------------------------------------------------------
  useEffect(() => {
    async function initPoseLandmarker() {
      try {
        const resolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: runningMode.current,
          numPoses: 1,
        });
        poseLandmarkerRef.current = landmarker;
        console.log("PoseLandmarker initialized");
      } catch (error) {
        console.error("Error initializing PoseLandmarker:", error);
      }
    }
    initPoseLandmarker();

    return () => {
      // Cleanup the animation frame on component unmount.
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // ----------------------------------------------------------------------
  // Pose detection and evaluation loop
  // ----------------------------------------------------------------------
  useEffect(() => {
    function detectPose() {
      const videoEl = cameraRef.current?.video;
      if (!videoEl || !poseLandmarkerRef.current) {
        animationFrameId.current = requestAnimationFrame(detectPose);
        return;
      }

      // Ensure video data is available
      if (videoEl.readyState < 2) {
        animationFrameId.current = requestAnimationFrame(detectPose);
        return;
      }

      const timestamp = performance.now();

      // Switch running mode to "VIDEO" once the video feed is live.
      if (runningMode.current === "IMAGE") {
        runningMode.current = "VIDEO";
        poseLandmarkerRef.current.setOptions({ runningMode: "VIDEO" });
      }

      // Only process a new frame if the video's currentTime has advanced.
      if (videoEl.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = videoEl.currentTime;
        try {
          // Process the current frame; detectForVideo is synchronous in VIDEO mode.
          const result = poseLandmarkerRef.current.detectForVideo(videoEl, timestamp);
          if (result && result.landmarks && result.landmarks.length > 0) {
            // Retrieve the landmarks for the first detected pose.
            const poseLandmarks = result.landmarks[0];
            // Use isBadPosture to determine if the posture is bad.
            const evaluation = isBadPosture(poseLandmarks) ? "Bad Posture" : "Good Posture";
            setPoseResult(evaluation);
          } else {
            setPoseResult("No Pose Detected");
          }
        } catch (error) {
          console.error("Pose detection error:", error);
        }
      }

      // Continue the detection loop.
      animationFrameId.current = requestAnimationFrame(detectPose);
    }

    animationFrameId.current = requestAnimationFrame(detectPose);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      {/* The CameraRecorder component displays the live webcam feed */}
      <CameraRecorder ref={cameraRef} />
      {/* Overlay showing the pose evaluation result */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0, 0, 0, 0.6)",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        {poseResult}
      </div>
    </div>
  );
};

export default PoseEvaluator;
