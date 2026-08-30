// hooks/useProctoring.js
// Handles camera + screen share + face detection + violation logging
// Uses face-api.js (free, runs entirely in browser, no API cost)

import { useState, useRef, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";

const MODELS_URL        = "/models";       // public/models/
const CHECK_INTERVAL_MS = 4000;            // check every 4 seconds
const LOOK_AWAY_THRESHOLD = 25;            // degrees — head turn threshold

export function useProctoring() {
  const [status,     setStatus]     = useState("idle");
  // idle | requesting | active | error
  const [violations, setViolations] = useState([]);
  const [warning,    setWarning]    = useState(null);
  const [modelsReady, setModelsReady] = useState(false);

  // Streams
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Detection elements
  const videoRef    = useRef(null);   // hidden video for camera feed
  const canvasRef   = useRef(null);   // hidden canvas for frame capture
  const intervalRef = useRef(null);

  // Violation counter (for report)
  const violationCountRef = useRef({
    no_face:       0,
    multiple_faces: 0,
    looking_away:  0,
    tab_switch:    0,
    screen_share_stopped: 0,
  });

  // ── Load face-api.js models ──────────────────────────────────
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
        ]);
        setModelsReady(true);
      } catch (err) {
        console.warn("face-api.js models failed to load:", err);
        // Still allow proctoring — screen share works without face detection
        setModelsReady(false);
      }
    };
    loadModels();
  }, []);

  // ── Log a violation ──────────────────────────────────────────
  const logViolation = useCallback((type, message) => {
    const violation = {
      type,
      message,
      timestamp: new Date().toISOString(),
      time:      new Date().toLocaleTimeString(),
    };
    setViolations(prev => [...prev, violation]);
    violationCountRef.current[type] = (violationCountRef.current[type] || 0) + 1;

    // Show warning to user — clears after 4 seconds
    setWarning(message);
    setTimeout(() => setWarning(null), 4000);
  }, []);

  // ── Tab visibility detection ─────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && status === "active") {
        logViolation("tab_switch", "⚠ Tab switch detected — please stay on the interview page.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [status, logViolation]);

  // ── Start proctoring ─────────────────────────────────────────
  const startProctoring = useCallback(async () => {
    setStatus("requesting");
    try {
      // 1. Request camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      cameraStreamRef.current = cameraStream;

      // Attach to hidden video element for face-api.js
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        await videoRef.current.play();
      }

      // 2. Request screen share
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      screenStreamRef.current = screenStream;

      // Detect if user stops screen share manually
      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        logViolation(
          "screen_share_stopped",
          "⚠ Screen share was stopped. Please share your screen to continue."
        );
      });

      setStatus("active");
      startDetectionLoop();

    } catch (err) {
      console.error("Proctoring setup failed:", err);
      if (err.name === "NotAllowedError") {
        setStatus("error");
        setWarning("Camera and screen share permission is required to start the interview.");
      } else {
        setStatus("error");
        setWarning("Could not start proctoring. Please allow camera and screen access.");
      }
    }
  }, [modelsReady]);

  // ── Face detection loop ───────────────────────────────────────
  const startDetectionLoop = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !modelsReady) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length === 0) {
          logViolation("no_face", "⚠ No face detected — please face the camera.");
          return;
        }

        if (detections.length > 1) {
          logViolation("multiple_faces", "⚠ Multiple faces detected — only you should be visible.");
          return;
        }

        // Single face detected — check gaze direction
        const landmarks  = detections[0].landmarks;
        const nose       = landmarks.getNose();
        const leftEye    = landmarks.getLeftEye();
        const rightEye   = landmarks.getRightEye();

        // Calculate horizontal head turn using eye and nose positions
        const eyeCenterX     = (leftEye[0].x + rightEye[3].x) / 2;
        const noseTipX       = nose[3].x;
        const faceWidth      = Math.abs(rightEye[3].x - leftEye[0].x);
        const horizontalDiff = Math.abs(noseTipX - eyeCenterX);
        const turnRatio      = horizontalDiff / faceWidth;

        if (turnRatio > 0.35) {
          logViolation("looking_away", "⚠ Please look at the screen — looking away detected.");
        }

      } catch (err) {
        // Silent — detection errors don't crash the interview
      }
    }, CHECK_INTERVAL_MS);
  }, [modelsReady, logViolation]);

  // ── Stop proctoring ───────────────────────────────────────────
  const stopProctoring = useCallback(() => {
    clearInterval(intervalRef.current);

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, []);

  // ── Get summary for feedback report ──────────────────────────
  const getProctoringReport = useCallback(() => {
    const counts  = violationCountRef.current;
    const total   = Object.values(counts).reduce((a, b) => a + b, 0);
    const integrityScore = Math.max(0, 10 - Math.floor(total / 2));

    return {
      total_violations:  total,
      integrity_score:   integrityScore,
      violation_counts:  counts,
      violations_log:    violations,
      summary: total === 0
        ? "No integrity violations detected. Candidate maintained full focus throughout."
        : `${total} violation(s) detected: ${
            Object.entries(counts)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${k.replace(/_/g, " ")} (${v}x)`)
              .join(", ")
          }.`
    };
  }, [violations]);

  return {
    // State
    status,
    violations,
    warning,
    modelsReady,

    // Refs — attach to hidden elements in JSX
    videoRef,
    canvasRef,

    // Stream refs — for displaying preview
    cameraStreamRef,
    screenStreamRef,

    // Actions
    startProctoring,
    stopProctoring,
    getProctoringReport,
  };
}