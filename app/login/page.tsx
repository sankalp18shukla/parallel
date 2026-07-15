"use client"

import { useState } from "react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function LoginPage(){
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log({ mode, email, password });
    }

    function handleGoogleAuth() {
        console.log("google auth clicked");
    }

    return (
        <main className="auth-page">
            <div className="auth-card glass-card">
                <Logo />
                <h1 className= "auth-heading">
                    {mode === "login" ? "Welcome back" : "Enter Parallel"}
                </h1>
                <p className= "auth-subtext">
                    {mode === "login"
                    ? "Your next interesting coversation is waiting."
                    : "Strangers with interesting minds. No name yet."}
                </p>
                <button type="button" className = "btn btn-full google-btn" onClick={handleGoogleAuth}>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                </button>
                <div className="auth-divider">
                    <span>or</span>
                </div>
                <form className="auth-form" onSubmit= {handleSubmit}>
                    <label className="auth-label">
                        Email
                        <input
                          type="email"
                          className="glass-input auth-input"
                          placeholder="you@work.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                    </label>
                    <label className ="auth-label">
                        Password
                        <input
                         type="password"
                         className="glass-input auth-input"
                         placeholder=""
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         minLength={8}
                        />                 
                    </label>
                    <Button type="submit" full>
                        {mode === "login"? "Log In" : "Sign Up"}
                    </Button>
                </form>
                <p className="auth-switch">
                    {mode === "login" ? "New here?" : "Already in?"}{""}
                    <button
                        type="button"
                        className="auth-switch-link"
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    >
                        {mode === "login" ? "Sign up" : "Log in"}
                    </button>
                </p>
            </div>
        </main>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
    );
}
