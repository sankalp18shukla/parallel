"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  type: "text" | "proposal" | "system";
  content: string | null;
  proposal_time: string | null;
  created_at: string;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const connectId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [myId, setMyId] = useState("");
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [proposedTime, setProposedTime] = useState("");

  const myTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setMyId(userData.user.id);

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("connect_id", connectId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
    }
    init();

    // Naya message aane pe real-time update
    const channel = supabase
      .channel(`messages-${connectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `connect_id=eq.${connectId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectId]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    await supabase.from("messages").insert({
      connect_id: connectId,
      sender_id: myId,
      type: "text",
      content: draft,
    });
    setDraft("");
  }

  async function sendProposal() {
    if (!proposedTime) return;
    await supabase.from("messages").insert({
      connect_id: connectId,
      sender_id: myId,
      type: "proposal",
      content: `Proposed in ${myTimezone}`,
      proposal_time: new Date(proposedTime).toISOString(),
    });
    setShowProposeForm(false);
    setProposedTime("");
  }

  async function confirmMeeting(msg: Message) {
    if (!msg.proposal_time) return;

    await supabase.from("connects").update({ status: "scheduled" }).eq("id", connectId);
    await supabase.from("meetings").insert({
      connect_id: connectId,
      scheduled_time: msg.proposal_time,
      meet_link: "https://meet.google.com/new",
    });
    await supabase.from("messages").insert({
      connect_id: connectId,
      sender_id: myId,
      type: "system",
      content: "Meeting confirmed. Check your email for the link.",
    });

    await fetch("/api/notify-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectId, scheduledTime: msg.proposal_time }),
    });

    await fetch("/api/notify-meeting", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ connectId, scheduledTime: msg.proposal_time }),
});
  }
  

  function formatForTz(iso: string, tz: string) {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="chat-page">
      <div className="chat-header glass-nav">
        <button className="chat-back" onClick={() => router.push("/connects")}>
          <ArrowLeft size={20} />
        </button>
        <span className="chat-header-title">Chat · #{connectId.slice(0, 6)}</span>
        <div style={{ width: 20 }} />
      </div>

      <div className="chat-caution glass-card">
        <p className="warning-title">Before you continue</p>
        <p className="warning-text">
          This chat is only for fixing a time to meet. Don't share names, contact info, or anything
          identifying. Chats aren't encrypted and can be reviewed. Get caught working around this,
          and it's a permanent ban.
        </p>
      </div>

      <div className="chat-messages">
        {messages.map((m) => {
          if (m.type === "system") {
            return <div key={m.id} className="chat-system-msg">{m.content}</div>;
          }
          if (m.type === "proposal" && m.proposal_time) {
            return (
              <div key={m.id} className="chat-proposal-card glass-card">
                <p className="card-tag">Proposed time</p>
                <p className="card-title small">{formatForTz(m.proposal_time, myTimezone)} (your time)</p>
                {m.sender_id !== myId && (
                  <button className="chat-confirm-btn" onClick={() => confirmMeeting(m)}>
                    Confirm this time
                  </button>
                )}
              </div>
            );
          }
          return (
            <div key={m.id} className={`chat-bubble ${m.sender_id === myId ? "me" : "them"}`}>
              {m.content}
            </div>
          );
        })}
      </div>

      {showProposeForm && (
        <div className="chat-propose-panel glass-card">
          <label className="auth-label">
            Pick a time ({myTimezone})
            <input
              type="datetime-local"
              className="glass-input auth-input time-picker-input"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
            />
          </label>
          <button className="btn btn-full" onClick={sendProposal}>Send proposal</button>
        </div>
      )}

      <div className="chat-toolbar">
        <button className="chat-propose-toggle" onClick={() => setShowProposeForm((v) => !v)}>
          {showProposeForm ? "Cancel" : "Propose a time"}
        </button>
      </div>

      <form className="chat-input-row glass-nav" onSubmit={sendMessage}>
        <input
          className="chat-input"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}