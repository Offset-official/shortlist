import { Landmark } from "./types";

export const isBadPosture = (landmarks: Landmark[]): boolean => {
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

  // Return true if the distance is less than the threshold.
  return distance < 0.3;
};

export const getPoseStatus = (landmarks: Landmark[]): "Good Pose" | "Bad Pose" => {
  return isBadPosture(landmarks) ? "Bad Pose" : "Good Pose";
};
