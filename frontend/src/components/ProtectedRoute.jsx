import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext, isTokenExpired } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, logout } = useContext(AuthContext);
  const storedToken = token || localStorage.getItem("token");

  if (!storedToken) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(storedToken)) {
    logout();
    return <Navigate to="/login?expired=true" replace />;
  }

  return children;
}

