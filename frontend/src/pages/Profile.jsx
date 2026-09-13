import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Profile.css";

const BASE_URL = import.meta.env.VITE_API_URL;

const SCORE_COLOR = (s) =>
  s >= 8 ? "#4ade80" : s >= 6 ? "#c8f135" : s >= 4 ? "#f59e0b" : "#ef4444";

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const navigate   = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ name: "", bio: "", college: "", role: "" });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const fileRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        navigate("/login?expired=true");
        return;
      }
      if (!res.ok) {
        setData(null);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setForm({
        name:    json.name    || "",
        bio:     json.bio     || "",
        college: json.college || "",
        role:    json.role    || "",
      });
    } catch { /* silent */ }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/profile/update`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      if (res.status === 401) {
        logout();
        navigate("/login?expired=true");
        return;
      }
      setSaveMsg("Saved ✓");
      setEditing(false);
      fetchProfile();
      setTimeout(() => setSaveMsg(""), 2000);
    } catch { setSaveMsg("Failed to save."); }
    setSaving(false);
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch(`${BASE_URL}/profile/avatar`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      if (res.status === 401) {
        logout();
        navigate("/login?expired=true");
        return;
      }
      const json = await res.json();
      setData(d => ({ ...d, avatar_url: json.avatar_url }));
    } catch { alert("Upload failed."); }
    setAvatarUploading(false);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading) return (
    <div className="prof-page">
      <div className="prof-loading"><div className="prof-spin" />Loading profile...</div>
    </div>
  );

  if (!data) return (
    <div className="prof-page">
      <div className="prof-loading">Could not load profile.</div>
    </div>
  );

  const { stats, history, recommendation } = data;
  const initials = data.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <div className="prof-page">
      <div className="prof-orb-1" /><div className="prof-orb-2" /><div className="prof-grid" />

      <div className="prof-content">

        {/* ── HERO CARD ── */}
        <div className="prof-hero">
          {/* Avatar */}
          <div className="prof-avatar-wrap">
            {data.avatar_url
              ? <img src={data.avatar_url} alt="avatar" className="prof-avatar-img" />
              : <div className="prof-avatar-initials">{initials}</div>
            }
            {!data.is_google_user && (
              <button
                className="prof-avatar-edit"
                onClick={() => fileRef.current?.click()}
                title="Change photo"
              >
                {avatarUploading ? "..." : "📷"}
              </button>
            )}
            {data.is_google_user && (
              <div className="prof-google-badge" title="Signed in with Google">G</div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadAvatar} />
          </div>

          {/* Info */}
          <div className="prof-hero-info">
            {editing ? (
              <input
                className="prof-input prof-name-input"
                value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Your name"
              />
            ) : (
              <h1 className="prof-name">{data.name}</h1>
            )}
            <div className="prof-email">{data.email}</div>

            {editing ? (
              <input className="prof-input" value={form.role}
                onChange={e => setForm(f => ({...f, role: e.target.value}))}
                placeholder="Current role (e.g. Frontend Developer)" />
            ) : (
              data.role && <div className="prof-role">{data.role}</div>
            )}

            {editing ? (
              <input className="prof-input" value={form.college}
                onChange={e => setForm(f => ({...f, college: e.target.value}))}
                placeholder="College / Institution" />
            ) : (
              data.college && <div className="prof-college">🎓 {data.college}</div>
            )}

            {editing ? (
              <textarea className="prof-input prof-bio-input" value={form.bio}
                onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                placeholder="Short bio..." rows={2} />
            ) : (
              <p className="prof-bio">{data.bio || "No bio yet."}</p>
            )}

            <div className="prof-hero-actions">
              {editing ? (
                <>
                  <button className="prof-save-btn" onClick={saveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button className="prof-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button className="prof-edit-btn" onClick={() => setEditing(true)}>✏ Edit Profile</button>
              )}
              {saveMsg && <span className="prof-save-msg">{saveMsg}</span>}
              <button className="prof-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="prof-stats">
          {[
            { label: "Sessions",     value: stats.total_sessions },
            { label: "Avg Score",    value: stats.avg_overall ? `${stats.avg_overall}/10` : "—" },
            { label: "Best Score",   value: stats.best_overall ? `${stats.best_overall}/10` : "—" },
          ].map((s, i) => (
            <div className="prof-stat-card" key={i}>
              <div className="prof-stat-value">{s.value}</div>
              <div className="prof-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── AI RECOMMENDATION ── */}
        {recommendation && (
          <div className="prof-rec">
            <div className="prof-rec-header">
              <span className="prof-rec-dot" />
              AI Recommendation
            </div>
            <div className="prof-rec-focus">Focus: {recommendation.focus}</div>
            <p className="prof-rec-msg">{recommendation.message}</p>
            <div className="prof-rec-tip">💡 {recommendation.tip}</div>
          </div>
        )}

        

      </div>
    </div>
  );
}