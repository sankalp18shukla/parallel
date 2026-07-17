"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ShieldCheck, MessageSquare, LogOut, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

type FeedbackRow = {
  id: string;
  note: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [description, setDescription] = useState("");
  const [meetsCompleted, setMeetsCompleted] = useState(0);
  const [noShowFlag, setNoShowFlag] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const myId = userData.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("description, no_show_flag")
        .eq("id", myId)
        .single();

      setDescription(profile?.description ?? "");
      setNoShowFlag(profile?.no_show_flag ?? false);

      const { data: completedConnects } = await supabase
        .from("connects")
        .select("id")
        .or(`user_a.eq.${myId},user_b.eq.${myId}`)
        .eq("status", "completed");
      setMeetsCompleted(completedConnects?.length ?? 0);

      const { data: feedbackRows } = await supabase
        .from("feedback")
        .select("id, note")
        .eq("about_user", myId);
      setFeedback(feedbackRows ?? []);

      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return null;

  return (
    <div className="profile-page">
      <h1 className="page-heading">Profile</h1>

      <div className="glass-card profile-card">
        <div className="card-icon-badge">
          <Briefcase size={18} />
        </div>
        <h2 className="card-title">About you</h2>
        <p className="card-subtext">{description || "No description yet."}</p>
        <Button href="/onboarding" icon={<Pencil size={16} />}>Edit profile</Button>
      </div>

      <div className="glass-card profile-card accent-secondary">
        <div className="card-icon-badge">
          <ShieldCheck size={18} />
        </div>
        <h2 className="card-title">Track record</h2>
        <p className="card-subtext">{meetsCompleted} meets completed</p>
        {noShowFlag ? (
          <div className="glass-warning profile-warning">
            <p className="warning-title">No-show flagged</p>
            <p className="warning-text">You missed a confirmed meet without notice.</p>
          </div>
        ) : (
          <p className="card-subtext good-standing">Good standing, no missed meets.</p>
        )}
      </div>

      <div className="glass-card profile-card">
        <div className="card-icon-badge">
          <MessageSquare size={18} />
        </div>
        <h2 className="card-title">What people said</h2>
        {feedback.length === 0 && (
          <p className="empty-note">Nothing yet, your first meet will change that.</p>
        )}
        {feedback.map((f) => (
          <div key={f.id} className="feedback-item">
            <p className="card-tag">From a past connect</p>
            <p className="card-subtext">{f.note || "No comment left."}</p>
          </div>
        ))}
      </div>

      <button className="btn btn-full btn-standalone" onClick={handleLogout}>
        <LogOut size={16} className="btn-icon" style={{ marginRight: 8 }} />
        Log out
      </button>
    </div>
  );
}
