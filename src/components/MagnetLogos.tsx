"use client";
import React, { useMemo } from "react";
import Magnet from "@/components/reactbits/Magnet";
import { RiNetflixFill } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { FaMicrosoft } from "react-icons/fa";

// Four brand icons
const LOGOS = [
  { name: "Netflix",    icon: <RiNetflixFill /> },
  { name: "Google",     icon: <FaGoogle /> },
  { name: "Meta",       icon: <FaMeta /> },
  { name: "Microsoft",  icon: <FaMicrosoft /> },
];

export default function MagnetLogos() {
  // 1) Generate random ±10% offset for each logo
  //    We store them so they remain stable across re-renders.
  const offsets = useMemo(() => {
    return LOGOS.map(() => {
      const offsetX = (Math.random() * 20) - 10; // range: -10..+10
      const offsetY = (Math.random() * 20) - 10; // range: -10..+10
      return { x: offsetX, y: offsetY };
    });
  }, []);

  return (
    <div className="grid grid-cols-2 gap-1 w-full h-full place-items-center">
      {LOGOS.map((logo, i) => {
        const { x, y } = offsets[i];
        return (
          // 2) Wrap each item in Magnet for the magnet effect
          <Magnet key={logo.name} padding={80} magnetStrength={1.5}>
            <div
              // 3) Apply random offset transform (±10%)
              style={{
                fontSize: "4rem",
                color: "#fff",
                padding: "50px",
                transform: `translate(${x}%, ${y}%)`,
              }}
            >
              {logo.icon}
            </div>
          </Magnet>
        );
      })}
    </div>
  );
}
