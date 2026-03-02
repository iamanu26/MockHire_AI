import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrapper}>
      <main style={styles.heroSection}>
        {/* Left Column */}
        <div style={styles.contentSide}>
          <p style={styles.topBadge}>AI INTERVIEW ASSISTANT</p>

          <h1 style={styles.title}>
            MockHire AI
          </h1>

          <p style={styles.subtitle}>
            Step into a high-fidelity 3D interview environment powered by LLaMA intelligence.
            Refine your voice, master your presence, and conquer the technical stage.
          </p>

          <div style={styles.buttonGroup}>
            <Link to="/login">
              <button style={styles.primaryBtn}>START INTERVIEW</button>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.imageSide} >
          <img
            src="/mockhire-ai.png" 
            alt="MockHire AI Illustration"
            style={styles.heroImage}
          />
        </div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    // DARK MODE: Deep Navy/Black Background
    backgroundColor: "#020617", 
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflowX: "hidden",
  },
  heroSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "1200px",
    width: "100%",
    padding: "0 40px",
    gap: "60px",
    flex: 1,
  },
  contentSide: {
    flex: 1,
    textAlign: "left",
  },
  topBadge: {
    // Electric Blue for visibility in dark mode
    color: "#3b82f6", 
    fontWeight: "800",
    fontSize: "14px",
    letterSpacing: "1.5px",
    marginBottom: "15px",
  },
  title: {
    fontSize: "72px",
    fontWeight: "900",
    lineHeight: "1.1",
    // DARK MODE: Pure White/Silver
    color: "#f8fafc", 
    margin: "0 0 25px 0",
    letterSpacing: "-2px",
  },
  subtitle: {
    fontSize: "19px",
    lineHeight: "1.6",
    // DARK MODE: Muted Slate
    color: "#94a3b8", 
    marginBottom: "40px",
    maxWidth: "500px",
  },
  primaryBtn: {
    padding: "16px 36px",
    fontSize: "15px",
    fontWeight: "700",
    // DARK MODE: White button with dark text for high contrast
    background: "#fff",
    color: "#000",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    transition: "transform 0.2s",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
  },
  imageSide: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    maxWidth: "550px",
    height: "auto",
    // Adds a subtle glow behind the image in dark mode
    filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))",
  }
};