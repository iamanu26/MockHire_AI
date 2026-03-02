import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7; // Keeping speed consistent with Home page
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.access_token) {
        login(data.access_token);
        navigate("/interview");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Server error. Please check if backend is running.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Reusing the cinematic background video */}
      <video ref={videoRef} autoPlay loop muted playsInline style={styles.bgVideo}>
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay}></div>

      {/* Glassmorphism Login Card */}
      <div className="glass-card" style={styles.card}>
        <h1 className="text-gradient" style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Enter your details to continue your prep.</p>

        <div style={styles.inputGroup}>
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

        <button style={styles.loginBtn} onClick={handleLogin}>
          Sign In
        </button>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>Register</Link>
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
    background: "rgba(2, 6, 23, 0.6)",
    zIndex: -1,
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "50px 40px",
    textAlign: "center",
    // These classes should be in your index.css: glass-card
  },
  title: {
    fontSize: "32px",
    fontWeight: "900",
    marginBottom: "10px",
    letterSpacing: "-1px",
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
    transition: "border-color 0.3s",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
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

export default Login;