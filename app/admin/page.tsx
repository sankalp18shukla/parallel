"use client";

import { useEffect, useState } from "react";

type Profile = {
  id: string;
  description: string;
  companies: string;
  timezone: string;
};

export default function AdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/profiles")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(`Access denied: ${data.error}`);
        } else {
          setProfiles(data.profiles);
        }
        setLoading(false);
      });
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  async function makeConnect() {
    if (selected.length !== 2) return;
    const res = await fetch("/api/admin/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userA: selected[0], userB: selected[1] }),
    });
    const result = await res.json();
    setMessage(result.success ? "Connected!" : `Error: ${result.error}`);
    setSelected([]);
  }

  if (loading) return <div style={{ padding: 40, color: "white" }}>Loading…</div>;

  return (
    <div style={{ padding: 40, color: "white", fontFamily: "sans-serif" }}>
      <h1>Admin — Manual Matching</h1>
      <p>{message}</p>
      <p>Select exactly 2 people, then click Connect.</p>

      <button
        onClick={makeConnect}
        disabled={selected.length !== 2}
        style={{ padding: "10px 20px", margin: "16px 0", cursor: "pointer" }}
      >
        Connect Selected ({selected.length}/2)
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            <th></th>
            <th>Description</th>
            <th>Companies</th>
            <th>Timezone</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #333" }}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggleSelect(p.id)}
                />
              </td>
              <td style={{ padding: "8px 0" }}>{p.description}</td>
              <td>{p.companies}</td>
              <td>{p.timezone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}