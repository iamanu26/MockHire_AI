import { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export const getTokenRemainingMs = (token) => {
  if (!token) return 0;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return 0;
    const payload = JSON.parse(atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return Infinity;
    return payload.exp * 1000 - Date.now();
  } catch {
    return 0;
  }
};

export const isTokenExpired = (token) => {
  return getTokenRemainingMs(token) <= 0;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("token");
    if (!saved || isTokenExpired(saved)) {
      if (saved) localStorage.removeItem("token");
      return null;
    }
    return saved;
  });

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?expired=true";
    }
  }, []);

  const login = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  useEffect(() => {
    if (!token) return;

    const remaining = getTokenRemainingMs(token);
    if (remaining <= 0) {
      handleSessionExpired();
      return;
    }

    // 1. Single timer scheduled exactly at the expiration instant (no polling)
    const timeoutId = setTimeout(() => {
      handleSessionExpired();
    }, Math.min(remaining, 2147483647));

    // 2. When returning to tab after sleep / inactive time
    const checkOnWake = () => {
      if (document.visibilityState === "visible") {
        const current = localStorage.getItem("token");
        if (!current || isTokenExpired(current)) {
          handleSessionExpired();
        }
      }
    };

    document.addEventListener("visibilitychange", checkOnWake);
    window.addEventListener("focus", checkOnWake);

    // 3. Listen for 401 response events
    const onSessionExpired = () => handleSessionExpired();
    window.addEventListener("auth:session-expired", onSessionExpired);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", checkOnWake);
      window.removeEventListener("focus", checkOnWake);
      window.removeEventListener("auth:session-expired", onSessionExpired);
    };
  }, [token, handleSessionExpired]);

  // 3. Global fetch response interceptor: auto-logout on any 401 from protected APIs
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 401) {
        const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
        const isAuthEndpoint =
          url.includes("/auth/login") ||
          url.includes("/auth/register") ||
          url.includes("/auth/reset-password");
        if (!isAuthEndpoint) {
          window.dispatchEvent(new Event("auth:session-expired"));
        }
      }
      return res;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        handleSessionExpired,
        isTokenExpired: () => isTokenExpired(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

