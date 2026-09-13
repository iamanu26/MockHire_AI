// components/ProctoringOverlay.jsx
// Shows: camera preview pip, screen share indicator, warnings, violation count
// Designed to sit on top of the Interview page

import { useEffect, useRef } from "react";
import "./ProctoringOverlay.css";

export default function ProctoringOverlay({
  status,
  warning,
  violations,
  videoRef,
  cameraStreamRef,
}) {
  const previewRef = useRef(null);

  // Attach camera stream to the visible preview pip
  useEffect(() => {
    if (previewRef.current && cameraStreamRef.current) {
      previewRef.current.srcObject = cameraStreamRef.current;
    }
  }, [status, cameraStreamRef]);

  if (status === "idle") return null;

  return (
    <>
      {/* ── Hidden video for face-api.js detection (not visible) ── */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        width={320}
        height={240}
        muted
        playsInline
      />

      {/* ── Camera PIP — bottom right corner ── */}
      {status === "active" && (
        <div className="proc-pip">
          <video
            ref={previewRef}
            className="proc-pip-video"
            muted
            playsInline
            autoPlay
          />
          <div className="proc-pip-label">
            <span className="proc-live-dot" />
            LIVE · {violations.length} violation{violations.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ── Screen share indicator — top right ── */}
      {status === "active" && (
        <div className="proc-screen-badge">
          <span className="proc-screen-dot" />
          Screen Monitored
        </div>
      )}

      {/* ── Warning toast — top center ── */}
      {warning && (
        <div className="proc-warning">
          <span className="proc-warn-icon">⚠</span>
          {warning}
        </div>
      )}

      {/* ── Requesting permissions screen ── */}
      {status === "requesting" && (
        <div className="proc-overlay">
          <div className="proc-modal">
            <div className="proc-modal-icon">🔒</div>
            <h2 className="proc-modal-title">Setting Up Proctoring</h2>
            <p className="proc-modal-desc">
              Please allow <strong>camera</strong> and <strong>screen share</strong> access
              when prompted by your browser.
            </p>
            <div className="proc-modal-steps">
              <div className="proc-step">📷 Camera — to verify your presence</div>
              <div className="proc-step">🖥️ Screen share — to detect tab switching</div>
            </div>
            <div className="proc-spinner" />
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {status === "error" && (
        <div className="proc-overlay">
          <div className="proc-modal proc-modal--error">
            <div className="proc-modal-icon">⚠️</div>
            <h2 className="proc-modal-title">Permission Required</h2>
            <p className="proc-modal-desc">
              Camera and screen share access is required to take this interview.
              Please refresh the page and allow both permissions.
            </p>
            <button
              className="proc-retry-btn"
              onClick={() => window.location.reload()}
            >
              Refresh & Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}