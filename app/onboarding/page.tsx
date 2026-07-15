"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";


export default function OnboardingPage() {
    const router = useRouter();
    const [ form, setForm ] = useState( {
        description: "",
        companies: "",
        timezone: "",
        twitter: "",
        linkedin: "",
        emailOptIn: false,
    });

    function update<K extends keyof typeof form>(key :K, value: (typeof form)[K]) {
        setForm((f) => ({...f, [key]: value}));
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log(form);
        router.push("/");
    }

    return (
        <main className="onboarding-page">
            <div className="glass-card onboarding-card">
                <h1 className="page-heading">Tell us who you are</h1>
                <p className="card-subtext"> So we can connect you with the best people. Employer names and handles stay private.</p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className= "auth-label">
                        What you do
                        <textarea 
                            className="glass-input auth-input onboarding-textarea"
                            placeholder="A couple lines on your work, and how many years you've been at it - skip the buzzwords."
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
                            placeholder="Comma separated - kept private, never shown"
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
                            No explicit behavior - drugs, sex, none of it. Ghost a meet without notice
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
                        <span>Email me when there's a new connect or a meeting locked in. Required - no spam, promise.</span>
                    </label>

                    <Button type="submit" full>
                        Enter Parallel
                    </Button>
                </form>
            </div>
        </main>
    );
}