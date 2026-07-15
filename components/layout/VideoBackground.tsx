"use client";
import { useState } from "react";


export default function VideoBackground() {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className = "video-bg-wrap">
            <video
                className={`video-bg ${loaded ? "loaded" : ""}`}
                src="/water.mp4"
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setLoaded(true)}
            />
            <div className="video-bg-tint"/>
        </div>
    );
}
