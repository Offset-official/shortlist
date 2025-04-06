"use client";
import React from "react";
import Magnet from "@/components/reactbits/Magnet";
import { RiNetflixFill } from "react-icons/ri";
import { FaGoogle } from "react-icons/fa";
import { FaMeta } from "react-icons/fa6";
import { FaMicrosoft } from "react-icons/fa";

const LOGOS = [
  { name: "Netflix",    icon: <RiNetflixFill /> },
  { name: "Google",     icon: <FaGoogle /> },
  { name: "Meta",       icon: <FaMeta /> },
  { name: "Microsoft",  icon: <FaMicrosoft /> },
];

export default function MagnetLogos() {
  return (
    <div
      // 2×2 grid with a tighter gap
      className="grid grid-cols-2 gap-1 w-full h-full place-items-center"
    >
      {LOGOS.map((logo) => (
        <Magnet key={logo.name} padding={80} magnetStrength={1.5}>
          <div style={{ fontSize: "4rem", color: "#fff", padding: "50px" }}>
            {logo.icon}
          </div>
        </Magnet>
      ))}
    </div>
  );
}
