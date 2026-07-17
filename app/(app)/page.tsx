"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Video, Calendar, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

const MOCK_UPCOMING_MEET = {
  scheduled: true,
  date: "Thu, 17 Jul",
  time: "6:30 PM",
};

export default function HomePage() {
  const supabase = createClient();
  const [searching, setSearching] = useState(false);
  const [matchMessage, setMatchMessage] = useState("");
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("search_status")
        .select("is_searching")
        .eq("user_id", userData.user.id)
        .single();
      setSearching(data?.is_searching ?? false);
    }
    loadStatus();
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

    if (newValue) {
      setLoadingMatch(true);
      const res = await fetch("/api/match", { method: "POST" });
      const result = await res.json();
      setLoadingMatch(false);

      if (result.matched) {
        setMatchMessage("Found someone! Check your Connects tab.");
      } else if (result.reason === "daily_limit_reached") {
        setMatchMessage("You've hit today's connect limit. Check back tomorrow.");
      } else {
        setMatchMessage("No match yet — we'll keep looking and email you.");
      }
    }
  }

  return (
    <div className="home-page">
      <h1 className="page-heading">Home</h1>

      {MOCK_UPCOMING_MEET.scheduled && (
        <div className="glass-card home-card accent-primary">
          <div className="card-icon-badge">
            <Calendar size={18} />
          </div>
          <span className="card-tag">Lined up</span>
          <h2 className="card-title">You're on for {MOCK_UPCOMING_MEET.date}</h2>
          <div className="card-divider" />
          <p className="card-subtext">
            {MOCK_UPCOMING_MEET.time} · the link lands in your inbox an hour before.
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
            ? "This isn't instant — we'll email you the second something clicks."
            : "Flip the switch and we'll go find someone interesting."}
        </p>

        {matchMessage && <p className="live-counter">{matchMessage}</p>}
        {searching && !matchMessage && <p className="live-counter">500+ actively looking for meets</p>}
      </div>

      <div className="glass-card home-card accent-secondary">
        <div className="card-icon-badge">
          <Users size={18} />
        </div>
        <h2 className="card-title">Connects</h2>
        <p className="card-subtext">People worth talking to. Go pick a time.</p>
        <Button href="/connects" icon={<ArrowRight size={16} />}>
          Talk to them
        </Button>
      </div>
    </div>
  );
}