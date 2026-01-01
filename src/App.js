import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./AuthProvider";

import AddTree from "./components/AddTree";
import TreeList from "./components/TreeList";
import Leaderboard from "./components/Leaderboard";
import AuthPage from "./components/Login";
import GrowthGallery from "./components/GrowthGallery";
import Profile from "./components/Profile";
import Redeem from "./components/Redeem";

import GamesHome from "./games/GamesHome";
import EcoQuiz from "./games/EcoQuiz/EcoQuiz";
import CarbonGuesser from "./games/CarbonGuesser/CarbonGuesser";
import PlantTicTacToe from "./games/Tic-Tac-Toe/TicTacToe";

import { signOut } from "firebase/auth";
import { auth } from "./firebase";

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

      {/* Navigation Buttons */}
      <button
        onClick={() => navigate("/leaderboard")}
        style={{ position: "absolute", top: 20, left: 20 }}
      >
        🏆 Leaderboard
      </button>

      <button
        onClick={() => navigate("/growth-gallery")}
        style={{ position: "absolute", top: 60, left: 20 }}
      >
        🌿 Growth Gallery
      </button>

      <button
        onClick={() => navigate("/profile")}
        style={{ position: "absolute", top: 100, left: 20 }}
      >
        👤 Profile
      </button>

      <button
        onClick={() => navigate("/redeem")}
        style={{ position: "absolute", top: 140, left: 20 }}
      >
        🎁 Redeem
      </button>

      <button
        onClick={() => navigate("/games")}
        style={{ position: "absolute", top: 180, left: 20 }}
      >
        🎮 Mini Games
      </button>

      <button
        onClick={() => navigate("/games/quiz")}
        style={{ position: "absolute", top: 220, left: 20 }}
      >
        🧠 Eco Quiz
      </button>

      <button
        onClick={() => navigate("/games/carbon-guesser")}
        style={{ position: "absolute", top: 260, left: 20 }}
      >
        🌍 Carbon Guesser
      </button>

      <button
        onClick={() => navigate("/games/tic-tac-toe")}
        style={{ position: "absolute", top: 300, left: 20 }}
      >
        🌱 Plant Tic-Tac-Toe
      </button>

      {/* Main Content */}
      <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
        <div style={{ flex: 1 }}>
          <AddTree />
        </div>
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
          {/* Core Pages */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/growth-gallery" element={<GrowthGallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/redeem" element={<Redeem />} />

          {/* Games */}
          <Route path="/games" element={<GamesHome />} />
          <Route path="/games/quiz" element={<EcoQuiz />} />
          <Route path="/games/carbon-guesser" element={<CarbonGuesser />} />
          <Route path="/games/tic-tac-toe" element={<PlantTicTacToe />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
