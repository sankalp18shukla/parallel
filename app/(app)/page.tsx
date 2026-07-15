"use client";
import { useState } from "react";
import { ArrowRight, Video, Calendar, Users } from "lucide-react";
import Button from "@/components/ui/Button";

const MOCK_UPCOMING_MEET = {
  scheduled: true,
  date: "Thu, 17 Jul",
  time: "6:30 PM",
};
const CONNECTS_FOUND = 3;
export default function HomePage() {
  const [searching, setSearching] = useState(true);
  return (
    <div className="home-page">
      <h1 className="page-heading">Home</h1>
      {MOCK_UPCOMING_MEET.scheduled && (
        <div className="glass-card home-card accent-primary">
          <div className="card-icon-badge">
            <Calendar size={18} />
          </div>
          <span className="card-tag">Lined up</span>
          <h2 className="card-title">
            You're on for {MOCK_UPCOMING_MEET.date}
          </h2>
          <p className="card-subtext">
            {MOCK_UPCOMING_MEET.time} ~ the link lands in your inbox an hour
            before.
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
            onClick={() => setSearching(!searching)}
          >
            <span className="search-toggle-knob" />
          </button>
        </div>
        <p className="card-subtext">
          {searching
            ? "This isn't instant - we'll email you the second something clicks."
            : "Flip the switch and we'll go find someone interesting."}
        </p>
        {searching && 
          <p className="live-counter"> 500+ actively looking for meets</p>
        }
      </div>
      <div className="glass-card home-card accent-secondary">
        <div className="card-icon-badge">
          <Users size={18} />
        </div>
        <h2 className="card-title">{CONNECTS_FOUND} connects found</h2>
        <p className="card-subtext">People worth talking to. Go pick a time.</p>
        <Button href="/connects" icon={<ArrowRight size={16} />}>
          Talk to them
        </Button>
      </div>
    </div>
  );
}
