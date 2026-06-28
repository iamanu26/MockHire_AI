// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import How_it_works from "./pages/How_it_works";
import Resources from "./pages/Resources";
import Dsapractice from "./pages/Dsapractice";
import Profile from "./pages/Profile";

// ── New auth pages ──────────────────────────────────────────────
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ResendVerification from "./pages/ResendVerification";
import GoogleCallback from "./pages/GoogleCallback";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Home />} />
          <Route path="/how_it_works" element={<How_it_works />} />

          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<Feedback />} />

          {/* ── Auth flow ── */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* ── Protected ── */}
          <Route path="/dsa-practice" element={
            <ProtectedRoute><Dsapractice /></ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute><Interview /></ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute><Resources /></ProtectedRoute>
          } />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dsa-practice"
            element={
              <ProtectedRoute>
                <Dsapractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Interview />
              </ProtectedRoute>
            }
          />

        </Routes>


      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;