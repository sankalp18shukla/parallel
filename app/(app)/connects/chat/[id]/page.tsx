"use client";

export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Send } from "lucide-react";
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
  const [connectStatus, setConnectStatus] = useState<string>("new");
  const timeInputRef = useRef<HTMLInputElement>(null);

  const myTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
  async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setMyId(userData.user.id);

      const { data: connectData } = await supabase
        .from("connects")
        .select("status")
        .eq("id", connectId)
        .single();
      setConnectStatus(connectData?.status ?? "new");

      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("connect_id", connectId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
    }
    init();

    const channel = supabase
      .channel(`messages-${connectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `connect_id=eq.${connectId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
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

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender_id: myId,
      type: "text",
      content: draft,
      proposal_time: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        connect_id: connectId,
        sender_id: myId,
        type: "text",
        content: optimisticMessage.content,
      })
      .select()
      .single();

    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));
    }
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
    setConnectStatus("scheduled");

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

  if (!myId) return null;

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
               {m.sender_id !== myId && connectStatus !== "scheduled" && (
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

      <div className="chat-bottom-bar">
        {showProposeForm && (
          <div className="chat-propose-panel glass-card">
            <label className="auth-label">
              Pick a time ({myTimezone})
              <input
                ref={timeInputRef}
                type="datetime-local"
                className="glass-input auth-input time-picker-input"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                onClick={() => timeInputRef.current?.showPicker?.()}
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
    </div>
  );
}