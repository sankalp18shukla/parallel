"use client";

import { useState } from "react";

interface VideoBackgroundProps {
  src: string;
  tint?: number;
}

export default function VideoBackground({ src, tint = 0.5 }: VideoBackgroundProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="video-bg-wrap">
      <video
        key={src}
        className={`video-bg ${loaded ? "loaded" : ""}`}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setLoaded(true)}
      />
      <div className="video-bg-tint" style={{ background: `rgba(0, 0, 0, ${tint})` }} />
    </div>
  );
}

