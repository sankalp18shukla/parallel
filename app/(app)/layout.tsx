"use client";

import { usePathname, useRouter } from "next/navigation";
import BottomNav from "@/components/nav/BottomNav";
import VideoBackground from "@/components/layout/VideoBackground";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function getVideoConfig(pathname: string) {
  if (pathname.startsWith("/profile")) return { src: "/space.mp4", tint: 0.55 };
  if (pathname.startsWith("/connects")) return { src: "/flower.mp4", tint: 0.15 };
  return { src: "/water.mp4", tint: 0.45 };
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [checking, setChecking] = useState(true);
  const video = getVideoConfig(pathname);
  const isChatPage = pathname.includes("/chat/");

  useEffect(() => {
    async function checkAccess() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (!profile) {
        router.push("/onboarding");
        return;
      }

      setChecking(false);
    }
    checkAccess();
  }, [pathname]);

  if (checking) return null;

  return (
    <div className="app-shell">
      <VideoBackground src={video.src} tint={video.tint} />
      <div className="app-content">{children}</div>
      {!isChatPage && <BottomNav />}
    </div>
  );
}