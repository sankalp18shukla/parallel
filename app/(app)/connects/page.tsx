"use client";

import { MessageCircle, Calendar, Clock } from "lucide-react";
import Button from "@/components/ui/Button";

const LINED_UP = [{ id: 1, when: "Thu, 17 Jul · 6.30 PM" }];
const NEW_CONNECTS = [
  { id: 1, blurb: "10 years in product design, ex-fintech." },
  { id: 2, blurb: "Backend engineer, obsessed with distribution systems." },
];
const HISTORY = [
  { id: 1, when: "2 Jul", note: "Great chat about design systems." },
];
export default function ConnectsPage() {
  return (
    <div className="connects-page">
      <h1 className="page-heading">Connects</h1>
      <section className="connects-section">
        <h2 className="section-label">Lined up</h2>
        {LINED_UP.length === 0 && (
          <p className="empty-note">Nothing scheduled yet.</p>
        )}
        {LINED_UP.map((item) => (
          <div key={item.id} className="glass-card connect-item">
            <div className="card-icon-badge small">
              <Calendar size={16} />
            </div>
            <span className="card-tag">Confirmed</span>
            <div className="card-divider" />
            <p className="card-title small">{item.when}</p>
            <Button href={`/connects/chat/${item.id}`}>Keep talking</Button>
          </div>
        ))}
      </section>

      <section className="connects-section">
        <h2 className="section-label">New connects</h2>
        {NEW_CONNECTS.map((item) => (
          <div key={item.id} className="glass-card connect-item">
            <p className="card-subtext">{item.blurb}</p>
            <Button
              icon={<MessageCircle size={16} />}
              href={`/connects/chat/${item.id}`}
            >
              Fix a time
            </Button>
          </div>
        ))}
      </section>
      <section className="connects-section">
        <h2 className="section-label">History</h2>
        {HISTORY.map((item) => (
          <div key={item.id} className="glass-card connect-item history-item">
            <div className="card-icon-row">
              <Clock size={14} />
              <span className="card-tag muted">{item.when}</span>
            </div>
            <div className="card-divider" />
            <p className="card-subtext">{item.note}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
