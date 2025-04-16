import { Landmark } from "./types";

export const getFacingDirection = (landmarks: Landmark[]): "Forward" | "Left" | "Right" => {
  if (landmarks.length < 473) {
    console.warn("Not enough landmarks provided for gaze estimation.");
    return "Forward"; // Default to forward if data is insufficient.
  }

  // Define indices for the right eye corners.
  const rightEyeOuter = landmarks[33];
  const rightEyeInner = landmarks[133];

  const irisLandmarks = landmarks.slice(468, 468 + 5);
  if (irisLandmarks.length < 5) {
    console.warn("Not enough iris landmarks for gaze estimation.");
    return "Forward";
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

  // Calculate the vector from the outer corner to the iris center.
  const AI = {
    x: irisCenter.x - rightEyeOuter.x,
    y: irisCenter.y - rightEyeOuter.y,
  };

  const dot = AI.x * AB.x + AI.y * AB.y;
  const norm2 = AB.x * AB.x + AB.y * AB.y;
  if (norm2 === 0) return "Forward";

  // Normalized position (t) along the eye line.
  const t = dot / norm2;

  // Determine the gaze direction based on t:
  // * t between 0.4 and 0.6 → "Forward"
  // * t < 0.4           → "Right"   (iris is closer to the outer corner)
  // * t > 0.6           → "Left"    (iris is closer to the inner corner)
  if (t < 0.4) {
    return "Right";
  } else if (t > 0.6) {
    return "Left";
  } else {
    return "Forward";
  }
};
