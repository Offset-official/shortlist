import React, { ReactNode } from "react";
import styles from "./GrainyHero.module.css";

interface GrainyHeroProps {
  children: ReactNode;
}

const GrainyHero = ({ children }: GrainyHeroProps) => (
  <div className={styles.heroWrapper}>
    {/* SVG noise filter */}

    {/* Blobs */}
    <div className={styles.blobCont}>
      <div className={`${styles.blob} ${styles.primary} bg-primary top-[300px] left-[100px] md:h-[350px] md:w-[350px]  h-[250px] w-[250px]`}></div>
      <div className={`${styles.blob} ${styles.secondary} bg-secondary top-[200px] right-0 md:h-[350px] md:w-[350px] h-[250px] w-[250px]`}></div>
    </div>
    {/* Content */}
    <div className={styles.content}>{children}</div>
  </div>
);

export default GrainyHero;
