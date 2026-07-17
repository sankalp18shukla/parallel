"use client";


import { usePathname, useRouter} from "next/navigation";
import BottomNav from "@/components/nav/BottomNav";
import VideoBackground from "@/components/layout/VideoBackground";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";


const VIDEO_BY_ROUTE: Record<string, {src: string; tint: number }> ={
   "/" : { src: "/water.mp4", tint : 0.45 },
   "/connects" : { src: "/flower.mp4", tint : 0.5 },
   "/profile" : { src: "/space.mp4", tint : 0.55 },
};


function getVideoConfig(pathname: string) {
   if (pathname.startsWith("/profile")) return { src: "/space.mp4", tint: 0.55 };
   if (pathname.startsWith("/connects")) return { src: "/flower.mp4", tint: 0.15};
   return { src: "/water.mp4", tint: 0.45 };
}


export default function AppLayout({ children} : { children: React.ReactNode }) {
   const pathname = usePathname();
   const router = useRouter();
   const supabase = createClient();
   const [checking, setChecking] = useState(true);
   const video = getVideoConfig(pathname);


   useEffect(() => {
       supabase.auth.getUser().then(({ data }) => {
           if (!data.user) {
               router.push("/login");
           } else {
               setChecking(false);
           }
       });
   }, []);
  
   if (checking) return null;


   return (
       <div className = "app-shell">
           <VideoBackground src={video.src} tint={video.tint}/>
           <div className="app-content">{children}</div>
           <BottomNav />
       </div>
   );
}
