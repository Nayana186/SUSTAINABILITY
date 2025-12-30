import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";

import AddTree from "./components/AddTree";
import TreeList from "./components/TreeList";
import Leaderboard from "./components/Leaderboard";
import AuthPage from "./components/Login";

import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import GrowthGallery from "./components/GrowthGallery";
import Profile from "./components/Profile";
import Redeem from "./components/Redeem";




/* ================= DASHBOARD ================= */

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 30,
        position: "relative",
      }}
    >
      <h1 style={{ textAlign: "center" }}>🌿 CQuester Prototype</h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "6px 12px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* Leaderboard Button */}
      <button
        onClick={() => navigate("/leaderboard")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "6px 12px",
          background: "#2e7d32",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        🏆 Leaderboard
      </button>
      {/* Growth Gallery Button */}
<button
  onClick={() => navigate("/growth-gallery")}
  style={{
    position: "absolute",
    top: 60,
    left: 20,
    padding: "6px 12px",
    background: "#388e3c",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  }}
>
  🌿 Growth Gallery
</button>
{/* Profile Button */}
<button
  onClick={() => navigate("/profile")}
  style={{
    position: "absolute",
    top: 100,
    left: 20,
    padding: "6px 12px",
    background: "#1b5e20",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  }}
>
  👤 Profile
</button>
<button
  onClick={() => navigate("/redeem")}
  style={{
    position: "absolute",
    top: 140,
    left: 20,
    padding: "6px 12px",
    background: "#00695c",
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  }}
>
  🎁 Redeem
</button>






      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "60px",
        }}
      >
        {/* LEFT - ADD TREE */}
        <div style={{ flex: 1 }}>
          <AddTree />
        </div>

        {/* RIGHT - TREE LIST */}
        <div style={{ flex: 2 }}>
          <TreeList />
        </div>
      </div>
    </div>
  );
}

/* ================= APP ROOT ================= */

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/growth-gallery" element={<GrowthGallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/redeem" element={<Redeem />} />



        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
