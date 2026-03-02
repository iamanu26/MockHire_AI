import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      // Maintaining the cinematic slow speed
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (error) {
      alert("Server error. Please check your connection.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Video */}
      <video ref={videoRef} autoPlay loop muted playsInline style={styles.bgVideo}>
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay}></div>

      {/* Glassmorphism Register Card */}
      <div className="glass-card" style={styles.card}>
        <h1 className="text-gradient" style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join MockHire AI and start your journey.</p>

        <div style={styles.inputGroup}>
          <input
            placeholder="Full Name"
            style={styles.input}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Email Address"
            style={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button style={styles.registerBtn} onClick={handleRegister}>
          Register
        </button>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  bgVideo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -2,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(2, 6, 23, 0.65)", // Slightly darker for focus
    zIndex: -1,
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "50px 40px",
    textAlign: "center",
    /* Reuses .glass-card from index.css */
  },
  title: {
    fontSize: "32px",
    fontWeight: "900",
    marginBottom: "10px",
    letterSpacing: "-1px",
    color: "#fff",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "30px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "25px",
  },
  input: {
    padding: "14px 20px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(0, 0, 0, 0.3)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  registerBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb", // Using the blue accent from your logo
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)",
    transition: "transform 0.2s",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#94a3b8",
  },
  link: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: "600",
  },
};