"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

const MOCK_MESSAGES = [
  { id: 1, from: "them" as const, type: "text" as const, text: "Hey! Saw we're both into distributed systems." },
  { id: 2, from: "me" as const, type: "text" as const, text: "Yeah, been deep in Kafka lately. You?" },
];

// Mock — this will come from their real profile timezone once backend exists
const THEIR_TIMEZONE = "America/New_York";

type Proposal = {
  iso: string;
  myTz: string;
  confirmedByMe: boolean;
  confirmedByThem: boolean;
};

type Message =
  | { id: number; from: "me" | "them"; type: "text"; text: string }
  | { id: number; from: "me" | "them"; type: "proposal"; proposal: Proposal }
  | { id: number; from: "system"; type: "system"; text: string };

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [draft, setDraft] = useState("");
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [proposedTime, setProposedTime] = useState("");

  const myTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: "me", type: "text", text: draft }]);
    setDraft("");
  }

  function sendProposal() {
    if (!proposedTime) return;
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        from: "me",
        type: "proposal",
        proposal: {
          iso: new Date(proposedTime).toISOString(),
          myTz: myTimezone,
          confirmedByMe: true,
          confirmedByThem: false,
        },
      },
    ]);
    setShowProposeForm(false);
    setProposedTime("");
  }

  function simulateTheirConfirm(msgId: number) {
    setMessages((m) =>
      m.map((msg) =>
        msg.id === msgId && msg.type === "proposal"
          ? { ...msg, proposal: { ...msg.proposal, confirmedByThem: true } }
          : msg
      )
    );
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: "system", type: "system", text: "Meeting confirmed. Check your email for the link." },
    ]);
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
        <span className="chat-header-title">Chat · #{String(params.id).slice(0, 6)}</span>
        <div style={{ width: 20 }} />
      </div>

      <div className="chat-caution glass-card">
        <p className="warning-title">Before you continue</p>
        <p className="warning-text">
          This chat is only for fixing a time to meet. Don't share names, contact info, or anything
          identifying — that's what breaks the whole system. Chats aren't encrypted and can be
          reviewed. Get caught working around this, and it's a permanent ban.
        </p>
      </div>

      <div className="chat-messages">
        {messages.map((m) => {
          if (m.type === "system") {
            return <div key={m.id} className="chat-system-msg">{m.text}</div>;
          }
          if (m.type === "proposal") {
            const bothConfirmed = m.proposal.confirmedByMe && m.proposal.confirmedByThem;
            return (
              <div key={m.id} className="chat-proposal-card glass-card">
                <p className="card-tag">Proposed time</p>
                <p className="card-title small">{formatForTz(m.proposal.iso, myTimezone)} (your time)</p>
                <p className="card-subtext">
                  {formatForTz(m.proposal.iso, THEIR_TIMEZONE)} (their time)
                </p>
                {bothConfirmed ? (
                  <span className="card-tag muted">Both confirmed</span>
                ) : (
                  <button className="btn" onClick={() => simulateTheirConfirm(m.id)}>
                    Simulate: they confirm (demo only)
                  </button>
                )}
              </div>
            );
          }
          return (
            <div key={m.id} className={`chat-bubble ${m.from === "me" ? "me" : "them"}`}>
              {m.text}
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
