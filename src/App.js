import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./AuthProvider";

import Home from "./components/Home";
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
import TreesPage from "./components/TreesPage"; // make sure the path is correct


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
      <h1 style={{ textAlign: "center" }}>🌿 CQuestER Dashboard</h1>

      {/* Logout */}
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

      {/* NAVIGATION */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <button onClick={() => navigate("/")}>🏠 Home</button><br />
        <button onClick={() => navigate("/leaderboard")}>🏆 Leaderboard</button><br />
        <button onClick={() => navigate("/growth-gallery")}>🌿 Growth Gallery</button><br />
        <button onClick={() => navigate("/profile")}>👤 Profile</button><br />
        <button onClick={() => navigate("/redeem")}>🎁 Redeem</button><br />
        <button onClick={() => navigate("/games")}>🎮 Mini Games</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", gap: 40, marginTop: 80 }}>
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
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* FEATURES */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/growth-gallery" element={<GrowthGallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/redeem" element={<Redeem />} />
          <Route path="/trees" element={<TreesPage />} />



          {/* GAMES */}
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
