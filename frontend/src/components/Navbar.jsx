import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL;

function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user info for avatar + name
  useEffect(() => {
    if (!token) { setUser(null); return; }
    fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setUser(d))
      .catch(() => { });
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navInner}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={styles.logoGroup}>
            <h2 style={styles.logo}>MockHire AI</h2>
          </div>
        </Link>

        {/* Links */}
        <div style={styles.links}>
          <Link style={styles.link} to="/">Home</Link>
          <Link style={styles.link} to="/how_it_works">How it works</Link>
          <Link style={styles.link} to="/resources">Resources</Link>
          <Link style={styles.link} to="/about">About</Link>

          {token ? (
            <>
              <Link style={styles.link} to="/interview">Interview</Link>

              {/* ── Avatar + Dropdown ── */}
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setOpen(o => !o)}
                  style={styles.avatarBtn}
                >
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" style={styles.avatarImg} />
                  ) : (
                    <div style={styles.avatarInitials}>{initials}</div>
                  )}
                  <span style={styles.chevron}>{open ? "▲" : "▼"}</span>
                </button>

                {open && (
                  <div style={styles.dropdown}>
                    {/* User info */}
                    <div style={styles.dropdownHeader}>
                      <div style={styles.dropdownName}>{user?.name || "User"}</div>
                      <div style={styles.dropdownEmail}>{user?.email}</div>
                    </div>

                    <div style={styles.dropdownDivider} />

                    {/* My Profile */}
                    <button
                      style={styles.dropdownItem}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => { setOpen(false); navigate("/profile"); }}
                    >
                      👤 My Profile
                    </button>

                    {/* Interview History */}
                    <button
                      style={styles.dropdownItem}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => { setOpen(false); navigate("/history"); }}
                    >
                      📋 Interview History
                    </button>

                    {/* Start Interview */}
                    <button
                      style={styles.dropdownItem}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => { setOpen(false); navigate("/interview"); }}
                    >
                      🎙️ Start Interview
                    </button>

                    <div style={styles.dropdownDivider} />

                    {/* Logout */}
                    <button
                      style={{ ...styles.dropdownItem, color: "#ef4444" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button style={styles.primaryBtn}>Get Started</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  // ── Original styles (unchanged) ──────────────────────────────
  navContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "20px 0",
    position: "fixed",
    top: 0, left: 0,
    zIndex: 1000,
  },
  navInner: {
    width: "90%",
    maxWidth: "1200px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 40px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    borderRadius: "50px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
  },
  logoGroup: {
    display: "flex", alignItems: "center", cursor: "pointer",
  },
  logo: {
    fontSize: "18px", fontWeight: "800", color: "#ffffff",
    letterSpacing: "-0.5px", margin: 0,
  },
  links: {
    display: "flex", gap: "25px", alignItems: "center",
  },
  link: {
    color: "#94a3b8", textDecoration: "none",
    fontWeight: "500", fontSize: "14px", transition: "color 0.2s",
  },
  primaryBtn: {
    background: "#ffffff", color: "#020617", border: "none",
    padding: "10px 24px", borderRadius: "25px", cursor: "pointer",
    fontSize: "14px", fontWeight: "700", transition: "transform 0.2s",
    boxShadow: "0 4px 15px rgba(255, 255, 255, 0.1)",
  },

  // ── New: Avatar button ────────────────────────────────────────
  avatarBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "40px", padding: "4px 12px 4px 4px",
    cursor: "pointer", transition: "all 0.2s",
  },
  avatarImg: {
    width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover",
  },
  avatarInitials: {
    width: "30px", height: "30px", borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "12px", fontWeight: "700", color: "#fff",
  },
  chevron: {
    color: "#4b5563", fontSize: "8px",
  },

  // ── New: Dropdown ─────────────────────────────────────────────
  dropdown: {
    position: "absolute", top: "calc(100% + 12px)", right: 0,
    width: "220px",
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px", overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
    zIndex: 2000,
  },
  dropdownHeader: {
    padding: "14px 16px",
  },
  dropdownName: {
    color: "#fff", fontSize: "14px", fontWeight: "700", marginBottom: "2px",
  },
  dropdownEmail: {
    color: "#4b5563", fontSize: "11px",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  dropdownDivider: {
    height: "1px", background: "rgba(255,255,255,0.07)",
  },
  dropdownItem: {
    display: "flex", alignItems: "center", gap: "10px",
    width: "100%", padding: "12px 16px",
    background: "transparent", border: "none",
    color: "#94a3b8", fontSize: "13px",
    fontFamily: "inherit",
    cursor: "pointer", textAlign: "left", transition: "all 0.15s",
  },
};

export default Navbar;