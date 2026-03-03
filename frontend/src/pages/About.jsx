import { useEffect, useRef } from "react";

export default function About() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <div style={styles.pageWrapper}>
      {/* Background Video */}
      <video ref={videoRef} autoPlay loop muted playsInline style={styles.bgVideo}>
        <source src="/Video.Guru_20260218_003548702.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay}></div>

      {/* Content Card */}
      <div className="glass-card" style={styles.container}>
        <h1 className="text-gradient" style={styles.title}>About MockHire AI</h1>
        
        <p style={styles.mainText}>
          MockHire AI was born out of a simple observation: <strong>Technical brilliance often gets lost in high-pressure interviews.</strong> Many talented students and professionals struggle not because of a lack of knowledge, but due to a lack of realistic, high-stakes practice.
        </p>

        <div style={styles.grid}>
          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>🤖 Intelligent Interviewers</h3>
            <p style={styles.featureText}>Powered by LLaMA intelligence, our AI adapts to your answers, asking relevant follow-up questions just like a human recruiter.</p>
          </div>
          
          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>🎙️ Voice-First Experience</h3>
            <p style={styles.featureText}>Integrated with advanced Text-to-Speech and Speech-to-Text, allowing you to practice natural verbal communication.</p>
          </div>

          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>📊 Detailed Feedback</h3>
            <p style={styles.featureText}>Receive an instant evaluation of your performance, including technical accuracy, sentiment analysis, and areas for improvement.</p>
          </div>

          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>🛡️ Safe Environment</h3>
            <p style={styles.featureText}>Our simulator provides a zero-risk platform to build the confidence needed for the real world.</p>
          </div>
        </div>

        <p style={styles.mission}>
          Our mission is to democratize high-quality interview coaching, making it available to anyone, anywhere, at any time.
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflowX: "hidden",
    padding: "100px 20px 60px 20px", // Top padding to avoid Navbar overlap
  },
  bgVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -2,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(2, 6, 23, 0.7)",
    zIndex: -1,
  },
  container: {
    maxWidth: "900px",
    padding: "60px",
    textAlign: "left",
    // Reuses .glass-card from index.css
  },
  title: {
    fontSize: "42px",
    fontWeight: "900",
    marginBottom: "30px",
    letterSpacing: "-1px",
  },
  mainText: {
    fontSize: "18px",
    lineHeight: "1.8",
    color: "#e2e8f0",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginBottom: "40px",
  },
  feature: {
    background: "rgba(255, 255, 255, 0.03)",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  featureTitle: {
    color: "#60a5fa",
    fontSize: "18px",
    marginBottom: "10px",
  },
  featureText: {
    fontSize: "14px",
    color: "#94a3b8",
    lineHeight: "1.6",
  },
  mission: {
    textAlign: "center",
    fontSize: "16px",
    fontStyle: "italic",
    color: "#60a5fa",
    marginTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    paddingTop: "30px",
  },
};