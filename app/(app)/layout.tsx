"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/nav/BottomNav";
import VideoBackground from "@/components/layout/VideoBackground";

const VIDEO_BY_ROUTE: Record<string, {src: string; tint: number }> ={
    "/" : { src: "/water.mp4", tint : 0.45 },
    "/connects" : { src: "/flower.mp4", tint : 0.5 },
    "/profile" : { src: "/space.mp4", tint : 0.55 },
};

export default function AppLayout({ children} : { children: React.ReactNode }) {
    const pathname = usePathname();
    const video = VIDEO_BY_ROUTE[pathname] ?? VIDEO_BY_ROUTE["/"];

    return (
        <div className = "app-shell">
            <VideoBackground src={video.src} tint={video.tint}/>
            <div className="app-content">{children}</div>
            <BottomNav />
        </div>
    );
}