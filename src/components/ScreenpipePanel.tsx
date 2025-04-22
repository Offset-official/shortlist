// components/ScreenpipePanel.tsx
"use client";

import ScreenpipeLogger from "@/components/ScreenpipeLogger";


interface Props {
  active: boolean;
  interviewId: string;
}

export default function ScreenpipePanel({active, interviewId} : Props) {
  // you can add any layout or controls around ScreenpipeLogger here later
  return <ScreenpipeLogger active={active} interviewId={interviewId || ""} />;
}
