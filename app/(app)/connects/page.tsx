"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { MessageCircle, Calendar, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type ConnectRow = {
  id: string;
  status: string;
  other_id: string;
  other_description: string;
  when: string | null;
};

export default function ConnectsPage() {
  const supabase = createClient();
  const [linedUp, setLinedUp] = useState<ConnectRow[]>([]);
  const [newConnects, setNewConnects] = useState<ConnectRow[]>([]);
  const [history, setHistory] = useState<ConnectRow[]>([]);

  useEffect(() => {
    async function loadConnects() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const myId = userData.user.id;

      const { data: connects } = await supabase
        .from("connects")
        .select("id, status, user_a, user_b")
        .or(`user_a.eq.${myId},user_b.eq.${myId}`);

      if (!connects || connects.length === 0) return;

      const otherIds = connects.map((c) => (c.user_a === myId ? c.user_b : c.user_a));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, description")
        .in("id", otherIds);

      const { data: meetings } = await supabase
        .from("meetings")
        .select("connect_id, scheduled_time")
        .in("connect_id", connects.map((c) => c.id));

      const rows: ConnectRow[] = connects.map((c) => {
        const otherId = c.user_a === myId ? c.user_b : c.user_a;
        const profile = profiles?.find((p) => p.id === otherId);
        const meeting = meetings?.find((m) => m.connect_id === c.id);
        return {
          id: c.id,
          status: c.status,
          other_id: otherId,
          other_description: profile?.description ?? "Profile not available",
          when: meeting
            ? new Date(meeting.scheduled_time).toLocaleString(undefined, {
                weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
              })
            : null,
        };
      });

      setLinedUp(rows.filter((r) => r.status === "scheduled"));
      setNewConnects(rows.filter((r) => r.status === "new"));
      setHistory(rows.filter((r) => r.status === "completed"));
    }
    loadConnects();
  }, []);

  return (
    <div className="connects-page">
      <h1 className="page-heading">Connects</h1>

      <section className="connects-section">
        <h2 className="section-label">Lined up</h2>
        {linedUp.length === 0 && <p className="empty-note">Nothing scheduled yet.</p>}
        {linedUp.map((item) => (
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
        {newConnects.length === 0 && <p className="empty-note">Nothing new yet, keep searching on Home.</p>}
        {newConnects.map((item) => (
          <div key={item.id} className="glass-card connect-item">
            <p className="card-subtext">{item.other_description}</p>
            <Button icon={<MessageCircle size={16} />} href={`/connects/chat/${item.id}`}>
              Fix a time
            </Button>
          </div>
        ))}
      </section>

      <section className="connects-section">
        <h2 className="section-label">History</h2>
        {history.length === 0 && <p className="empty-note">No past meets yet.</p>}
        {history.map((item) => (
          <div key={item.id} className="glass-card connect-item history-item">
            <div className="card-icon-row">
              <Clock size={14} />
              <span className="card-tag muted">Completed</span>
            </div>
            <div className="card-divider" />
            <p className="card-subtext">{item.other_description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}