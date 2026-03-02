import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navInner}>
        {/* Logo acts as a link to home */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={styles.logoGroup}>
            <h2 style={styles.logo}>MockHire AI</h2>
          </div>
        </Link>

        <div style={styles.links}>
          <Link style={styles.link} to="/">Home</Link>
          <div style={styles.linkWithIcon}>Features</div>
          <div style={styles.linkWithIcon}>Resources</div>
          <Link style={styles.link} to="/about">About</Link>
          
          {token ? (
            <>
              <Link style={styles.link} to="/interview">Interview</Link>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <>
              {/* Register link removed from here as requested */}
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button style={styles.primaryBtn}>Get Started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "20px 0",
    position: "fixed", // Changed to fixed to float over the video background
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  navInner: {
    width: "90%",
    maxWidth: "1200px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 40px",
    // Dark Mode Glassmorphism:
    background: "rgba(255, 255, 255, 0.05)", 
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    borderRadius: "50px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  logo: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#ffffff", // Changed to white for Dark Mode
    letterSpacing: "-0.5px",
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
  },
  link: {
    color: "#94a3b8", // Muted slate color
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    transition: "color 0.2s",
  },
  linkWithIcon: {
    color: "#94a3b8",
    fontWeight: "500",
    fontSize: "14px",
    cursor: "pointer",
  },
  primaryBtn: {
    background: "#ffffff", // White button for high contrast in dark mode
    color: "#020617",
    border: "none",
    padding: "10px 24px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    transition: "transform 0.2s",
    boxShadow: "0 4px 15px rgba(255, 255, 255, 0.1)",
  },
  logoutBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    padding: "10px 24px",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  }
};

export default Navbar;