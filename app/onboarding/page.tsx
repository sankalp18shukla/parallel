"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import VideoBackground from "@/components/layout/VideoBackground";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    description: "",
    companies: "",
    timezone: "",
    twitter: "",
    linkedin: "",
    emailOptIn: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadExisting() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("description, companies, timezone, twitter, linkedin, email_opt_in")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (existing) {
        setForm({
          description: existing.description ?? "",
          companies: existing.companies ?? "",
          timezone: existing.timezone ?? "",
          twitter: existing.twitter ?? "",
          linkedin: existing.linkedin ?? "",
          emailOptIn: existing.email_opt_in ?? false,
        });
      }
    }
    loadExisting();
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("You need to be logged in.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userData.user.id,
      description: form.description,
      companies: form.companies,
      timezone: form.timezone,
      twitter: form.twitter,
      linkedin: form.linkedin,
      email_opt_in: form.emailOptIn,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="onboarding-page">
      <VideoBackground src="/sky.mp4" tint={0.4} />
      <div className="glass-card onboarding-card">
        <h1 className="page-heading">Tell us who you are</h1>
        <p className="card-subtext">
          So we can connect you with the best people. Employer names and handles stay private.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            What you do
            <textarea
              className="glass-input auth-input onboarding-textarea"
              placeholder="A couple lines on your work, and how many years you've been at it, skip the buzzwords."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </label>

          <label className="auth-label">
            Companies you've worked at
            <input
              type="text"
              className="glass-input auth-input"
              placeholder="Comma separated, kept private, never shown"
              value={form.companies}
              onChange={(e) => update("companies", e.target.value)}
            />
          </label>

          <label className="auth-label">
            Timezone
            <input
              type="text"
              className="glass-input auth-input"
              placeholder="e.g. IST, GMT+5:30"
              value={form.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              required
            />
          </label>

          <div className="onboarding-row">
            <label className="auth-label">
              X (optional)
              <input
                type="text"
                className="glass-input auth-input"
                placeholder="@handle"
                value={form.twitter}
                onChange={(e) => update("twitter", e.target.value)}
              />
            </label>
            <label className="auth-label">
              LinkedIn (optional)
              <input
                type="text"
                className="glass-input auth-input"
                placeholder="profile URL"
                value={form.linkedin}
                onChange={(e) => update("linkedin", e.target.value)}
              />
            </label>
          </div>

          <div className="glass-warning onboarding-warning">
            <p className="warning-title">Keep it clean</p>
            <p className="warning-text">
              No explicit behavior; drugs, sex, none of it. Ghost a meet without notice
              and you'll start getting matched with other ghosts. That's the whole system.
            </p>
          </div>

          <label className="onboarding-checkbox">
            <input
              type="checkbox"
              checked={form.emailOptIn}
              onChange={(e) => update("emailOptIn", e.target.checked)}
              required
            />
            <span>Email me when there's a new connect or a meeting locked in. Required: no spam, promise.</span>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <Button type="submit" full>
            {loading ? "Saving…" : "Enter Parallel"}
          </Button>
        </form>
      </div>
    </main>
  );
}
