import { Briefcase, ShieldCheck, MessageSquare } from "lucide-react";

const PROFILE = {
    description: "10 years building product at early-stage startups.",
    meetsCompleted: 8,
    noShowFlag: false,
};

const FEEDBACK = [
    { id: 1, name: "Aditi R.", note: "Great energy, showed up on time, would talk again.", visible: true },
    { id: 2, name: "Rohan K", note: "dude was sharp man great guy", visible: true },
    { id: 3, name: "Someone", note: "dude was xyzjsjdhksnknk", visible: false },
];

export default function ProfilePage() {
    return (
        <div className="profile-page">
            <h1 className="page-heading">Profile</h1>
            <div className="glass-card profile-card">
                <div className= "card-icon-badge">
                    <Briefcase size={18} />
                </div>
                <h2 className="card-title">About you</h2>
                <p className="card-subtext">{PROFILE.description}</p>
            </div>

            <div className="glass-card profile-card accent-secondary">
                <div className="card-icon-badge">
                    <ShieldCheck size={18} />
                </div>
                <h2 className="card-title">Track record</h2>
                <p className="card-subtext">{PROFILE.meetsCompleted} meets completed</p>
                {PROFILE.noShowFlag ? (
                    <div className="glass-warning profile-warning">
                        <p className ="warning-title">No-show flagged</p>
                        <p className = "warning-text">You missed a confirmed meet without notice.</p>
                    </div>
                ) : (
                    <p className="card-subtext good standing"> Good standing - no missed meets.</p>
                )}
            </div>

            <div className="glass-card profile-card">
                <div className="card-icon-badge">
                    <MessageSquare size={18} />
                </div>
                <h2 className="card-title">What people said</h2>
                {FEEDBACK.map((f) => (
                    <div key={f.id} className = "feedback-item">
                        <p className="card-title small">{f.visible ? f.name : "Anonymous"}</p>
                        <p className="card-subtext">{f.note}</p>
                        <span className="card-tag muted">{f.visible ? "Shared with you" : "Kept private by them"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}