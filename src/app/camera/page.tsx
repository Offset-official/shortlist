"use client";

import { useEffect, useRef, useState } from "react";
import CameraRecorder, { CameraRecorderHandle } from "@/components/CameraRecorder";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export default function FaceDetectionPage() {
  // Reference to the CameraRecorder handle (exposing the underlying video element)
  const cameraRef = useRef<CameraRecorderHandle>(null);
  // FaceDetector instance reference
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  // State to track whether a face is detected
  const [faceDetected, setFaceDetected] = useState(false);

  // Track running mode—start with "IMAGE" then switch to "VIDEO" once the webcam feed is live.
  const runningMode = useRef<"IMAGE" | "VIDEO">("IMAGE");
  const lastVideoTime = useRef<number>(-1);
  const animationFrameId = useRef<number>(0);

  // Initialize the FaceDetector using the installed library (not the CDN link)
  useEffect(() => {
    async function initFaceDetector() {
      try {
        // NOTE: Adjust the path below if your WASM assets are elsewhere.
        const resolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        const detector = await FaceDetector.createFromOptions(resolver, {
          baseOptions: {
            // Use your model asset URL; this example uses the BlazeFace short range TFLite model.
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: runningMode.current, // Initially "IMAGE"
          numFaces: 1,
        });
        faceDetectorRef.current = detector;
        console.log("FaceDetector initialized");
      } catch (error) {
        console.error("Error initializing face detector:", error);
      }
    }
    initFaceDetector();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Start an animation loop to continuously process video frames for face detection.
  useEffect(() => {
    function detectFace() {
      const videoEl = cameraRef.current?.video;
      if (!videoEl || !faceDetectorRef.current) {
        animationFrameId.current = requestAnimationFrame(detectFace);
        return;
      }

      // Ensure the video has enough data.
      if (videoEl.readyState < 2) {
        animationFrameId.current = requestAnimationFrame(detectFace);
        return;
      }

      // Use performance.now() as timestamp.
      const timestamp = performance.now();

      // Switch running mode to VIDEO if needed.
      if (runningMode.current === "IMAGE") {
        runningMode.current = "VIDEO";
        faceDetectorRef.current.setOptions({ runningMode: "VIDEO" });
      }

      // Process a new frame only if currentTime has advanced.
      if (videoEl.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = videoEl.currentTime;
        try {
          // detectForVideo is synchronous in VIDEO mode.
          const result = faceDetectorRef.current.detectForVideo(videoEl, timestamp);
          if (result && result.detections && result.detections.length > 0) {
            setFaceDetected(true);
          } else {
            setFaceDetected(false);
          }
        } catch (error) {
          console.error("Face detection error:", error);
        }
      }

      animationFrameId.current = requestAnimationFrame(detectFace);
    }

    animationFrameId.current = requestAnimationFrame(detectFace);
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
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
      {/* The responsive CameraRecorder supplies the live video feed. */}
      <CameraRecorder ref={cameraRef} />
      {/* When a face is detected, display overlay text */}
      {faceDetected && (
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
          Face Detected!
        </div>
      )}
    </div>
  );
}
