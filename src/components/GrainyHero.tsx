import React, { ReactNode } from "react";
import styles from "./GrainyHero.module.css";

interface GrainyHeroProps {
  children: ReactNode;
}

const GrainyHero = ({ children }: GrainyHeroProps) => (
  <div className={styles.heroWrapper}>
    {/* SVG noise filter */}
    <svg className={styles.noiseSvg}>
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
        <feColorMatrix in="colorNoise" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" />
        <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
        <feBlend in="SourceGraphic" in2="monoNoise" mode="screen" />
      </filter>
    </svg>
    {/* Blobs */}
    <div className={styles.blobCont}>
      <div className={`${styles.blob} ${styles.primary}`}></div>
      <div className={`${styles.blob} ${styles.secondary}`}></div>
    </div>
    {/* Content */}
    <div className={styles.content}>{children}</div>
  </div>
);

export default GrainyHero;
