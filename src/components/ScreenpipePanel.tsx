// components/ScreenpipePanel.tsx
"use client";

import ScreenpipeLogger from "@/components/ScreenpipeLogger";


interface Props {
  active: boolean;
}

export default function ScreenpipePanel({active} : Props) {
  // you can add any layout or controls around ScreenpipeLogger here later
  return <ScreenpipeLogger active={active} />;
}
