"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Video, Calendar, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const supabase = createClient();
  const [searching, setSearching] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [upcomingMeet, setUpcomingMeet] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [newConnectsCount, setNewConnectsCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const myId = userData.user.id;

      const { data: statusData } = await supabase
        .from("search_status")
        .select("is_searching")
        .eq("user_id", myId)
        .single();
      setSearching(statusData?.is_searching ?? false);

      const { data: myConnects } = await supabase
        .from("connects")
        .select("id, status")
        .or(`user_a.eq.${myId},user_b.eq.${myId}`);

      const scheduledConnect = (myConnects ?? []).find(
        (c) => c.status === "scheduled",
      );
      if (scheduledConnect) {
        const { data: meeting } = await supabase
          .from("meetings")
          .select("scheduled_time")
          .eq("connect_id", scheduledConnect.id)
          .single();

        if (meeting?.scheduled_time) {
          const d = new Date(meeting.scheduled_time);
          setUpcomingMeet({
            date: d.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            time: d.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            }),
          });
        }
      }

      const newCount = (myConnects ?? []).filter(
        (c) => c.status === "new",
      ).length;
      setNewConnectsCount(newCount);
    }
    loadData();
  }, []);

  async function toggleSearch() {
    const newValue = !searching;
    setSearching(newValue);
    setMatchMessage("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("search_status").upsert({
      user_id: userData.user.id,
      is_searching: newValue,
      updated_at: new Date().toISOString(),
    });

    // Automatic matching abhi ke liye off hai — sirf admin panel se manual connect banega
    if (newValue) {
      setMatchMessage("We'll email you the moment something clicks.");
    }
  }

  return (
    <div className="home-page">
      <h1 className="page-heading">Home</h1>

      {upcomingMeet && (
        <div className="glass-card home-card accent-primary">
          <div className="card-icon-badge">
            <Calendar size={18} />
          </div>
          <span className="card-tag">Lined up</span>
          <h2 className="card-title">You're on for {upcomingMeet.date}</h2>
          <div className="card-divider" />
          <p className="card-subtext">
            {upcomingMeet.time} · the link lands in your inbox an hour before.
          </p>
          <div className="card-icon-row">
            <Video size={16} />
            <span>Details coming to your email</span>
          </div>
        </div>
      )}

      <div className="glass-card home-card">
        <div className="search-card-head">
          <div>
            <span className="card-tag">{searching ? "Searching" : "Idle"}</span>
            <h2 className="card-title">
              {searching ? "We're out there looking" : "Ready when you are"}
            </h2>
          </div>

          <button
            type="button"
            className={`search-toggle ${searching ? "on" : "off"}`}
            role="switch"
            aria-checked={searching}
            onClick={toggleSearch}
          >
            <span className="search-toggle-knob" />
          </button>
        </div>

        <p className="card-subtext">
          {loadingMatch
            ? "Checking for a match…"
            : searching
              ? "This isn't instant; we'll email you the second something clicks."
              : "Flip the switch and we'll go find someone interesting."}
        </p>

        {matchMessage && <p className="live-counter">{matchMessage}</p>}
      </div>

      <div className="glass-card home-card accent-secondary">
        <div className="card-icon-badge">
          <Users size={18} />
        </div>
        <h2 className="card-title">
          {newConnectsCount > 0
            ? `${newConnectsCount} connects found`
            : "Connects"}
        </h2>
        <p className="card-subtext">
          {newConnectsCount > 0
            ? "People worth talking to. Go pick a time."
            : "Nothing new yet."}
        </p>
        <Button href="/connects" icon={<ArrowRight size={16} />}>
          Talk to them
        </Button>
      </div>
    </div>
  );
}
