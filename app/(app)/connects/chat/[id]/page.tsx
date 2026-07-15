"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {ArrowLeft, Send, Calendar } from "lucide-react";

const MOCK_MESSAGES = [
    { id: 1, from: "them", text: "Hey! Saw we're both into distributed systems."},
    { id: 2, from: "me", text: "Yeah, been deep in Kafka lately. You?"},
    { id: 3, from: "them", text: "Postgres replication mostly. Want to grab a call sometime this week?"},
];
export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [draft, setDraft] = useState("");

    function sendMessage( e: FormEvent) {
        e.preventDefault();
        if (!draft.trim()) return;
        setMessages((m) => [...m, { id: Date.now(), from: "me", text: draft }]);
        setDraft("");
    }

    return (
        <div className="chat-page">
            <div className="chat-header glass-nav">
                <button className="chat-back" onClick={() => router.push('/connects')}>
                    <ArrowLeft size={20} />
                </button>
                <span className="chat-header-title">Chat · #{String(params.id).slice(0,6)}</span>
                <button className="chat-propose-btn" title="Propose a time">
                    <Calendar size={18} />
                </button>
            </div>
        <div className="chat-messages">
            {messages.map((m) => (
                <div key={m.id} className={`chat-bubble ${m.from === "me" ? "me" : "them"}`}>
                    {m.text}
                </div>
            ))}
        </div>

        <form className="chat-input-row glass-nav" onSubmit={sendMessage}>
            <input
                className="chat-input"
                placeholder="Type a message..."
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
