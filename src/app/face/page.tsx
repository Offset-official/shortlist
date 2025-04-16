"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// Define a basic Landmark interface.
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/**
 * Checks whether a set of face landmarks indicates that the person is facing forward.
 * Assumes that landmarks are provided in a specific order where:
 * - Index 33 is the outer corner of the right eye.
 * - Index 133 is the inner corner of the right eye.
 * - Indices 468-472 contain the iris landmarks.
 */
export const isFacingForward = (landmarks: Landmark[]): boolean => {
  if (landmarks.length < 473) {
    console.warn("Not enough landmarks provided for gaze estimation.");
    return false;
  }

  // Define indices for the right eye corners.
  const rightEyeOuter = landmarks[33];
  const rightEyeInner = landmarks[133];

  const irisLandmarks = landmarks.slice(468, 468 + 5);
  if (irisLandmarks.length < 5) {
    console.warn("Not enough iris landmarks for gaze estimation.");
    return false;
  }

  // Compute the iris center by averaging the iris landmark coordinates.
  const irisCenter = irisLandmarks.reduce(
    (acc, cur) => ({
      x: acc.x + cur.x,
      y: acc.y + cur.y,
      z: acc.z + cur.z,
      visibility: 0,
    }),
    { x: 0, y: 0, z: 0, visibility: 0 }
  );
  irisCenter.x /= irisLandmarks.length;
  irisCenter.y /= irisLandmarks.length;
  irisCenter.z /= irisLandmarks.length;

  // Calculate the vector from the outer to inner corner of the right eye.
  const AB = {
    x: rightEyeInner.x - rightEyeOuter.x,
    y: rightEyeInner.y - rightEyeOuter.y,
  };

  // Calculate the vector from the outer eye corner to the iris center.
  const AI = {
    x: irisCenter.x - rightEyeOuter.x,
    y: irisCenter.y - rightEyeOuter.y,
  };

  // Calculate the dot product and the squared magnitude of AB.
  const dot = AI.x * AB.x + AI.y * AB.y;
  const norm2 = AB.x * AB.x + AB.y * AB.y;
  if (norm2 === 0) {
    return false;
  }

  // Normalized position (t) along the eye line.
  const t = dot / norm2;

  // Return true if t is between the thresholds, indicating a forward gaze.
  return t >= 0.4 && t <= 0.6;
};

const FaceEvaluator: React.FC = () => {
  // Ref for the video element (webcam feed)
  const videoRef = useRef<HTMLVideoElement>(null);
  // Ref to store the FaceLandmarker instance
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  // State to show the detection result (facing forward or not)
  const [faceResult, setFaceResult] = useState<string>("No Face Detected");

  // ----------------------------------------------------------------------
  // Initialize the FaceLandmarker
  // ----------------------------------------------------------------------
  useEffect(() => {
    async function initFaceLandmarker() {
      try {
        // Resolve the WASM assets.
        const resolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        // Create the FaceLandmarker in VIDEO mode.
        const landmarker = await FaceLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: false, // Not using blendshapes in this example.
          runningMode: "VIDEO",
          numFaces: 1,
        });
        faceLandmarkerRef.current = landmarker;
        console.log("FaceLandmarker initialized");
      } catch (error) {
        console.error("Error initializing FaceLandmarker:", error);
      }
    }
    initFaceLandmarker();

    return () => {
      // Cleanup if necessary when the component unmounts.
    };
  }, []);

  // ----------------------------------------------------------------------
  // Start the webcam video stream.
  // ----------------------------------------------------------------------
  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }
    setupWebcam();
  }, []);

  // ----------------------------------------------------------------------
  // Run a detection loop to process video frames.
  // ----------------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number = 0;

    function detectFace() {
      const videoEl = videoRef.current;
      if (!videoEl || videoEl.readyState < 2) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }
      if (!faceLandmarkerRef.current) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      const timestamp = performance.now();

      try {
        // Process the current video frame.
        const result = faceLandmarkerRef.current.detectForVideo(videoEl, timestamp);
        if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
          // Get landmarks for the first detected face.
          const landmarks = result.faceLandmarks[0] as Landmark[];
          // Use the isFacingForward function to determine if the person is facing forward.
          const facing = isFacingForward(landmarks)
            ? "Facing Forward"
            : "Not Facing Forward";
          setFaceResult(facing);
        } else {
          setFaceResult("No Face Detected");
        }
      } catch (error) {
        console.error("Detection error:", error);
      }
      // Continue the detection loop.
      animationFrameId = requestAnimationFrame(detectFace);
    }

    animationFrameId = requestAnimationFrame(detectFace);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div style={{ position: "relative", width: "640px", margin: "0 auto" }}>
      {/* Display the live webcam feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", borderRadius: "8px" }}
      />
      {/* Overlay showing whether the person is facing forward */}
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
        {faceResult}
      </div>
    </div>
  );
};

export default FaceEvaluator;
