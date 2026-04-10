import { useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import './Login.css';
import './auth-additions.css';

/**
 * This page lives at /auth/callback in your frontend router.
 * The backend redirects here after Google OAuth with ?token=...
 * We store the token and redirect to /interview.
 */
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { login }      = useContext(AuthContext);
  const navigate       = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      navigate("/interview", { replace: true });
    } else {
      navigate("/login?error=google-failed", { replace: true });
    }
  }, []);

  return (
    <div style={{
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      height:          "100vh",
      background:      "#0f0f0f",
      color:           "#fff",
      flexDirection:   "column",
      gap:             16,
      fontFamily:      "Arial, sans-serif",
    }}>
      <div style={{ fontSize: 32 }}>⟳</div>
      <p style={{ color: "#aaa" }}>Signing you in with Google…</p>
    </div>
  );
}