import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

/* ================= COMPONENT IMPORTS ================= */
import Home from "./components/Home";
import TreeList from "./components/TreeList";
import Leaderboard from "./components/Leaderboard";
import AuthPage from "./components/Login";
import GrowthGallery from "./components/GrowthGallery";
import Profile from "./components/Profile";
import Redeem from "./components/Redeem";
import TreesPage from "./components/TreesPage";
import AddTree from "./components/AddTree";
import PlantationForm from "./components/PlantationForm";

/* ================= GAMES ================= */
import GamesHome from "./games/GamesHome";
import EcoQuiz from "./games/EcoQuiz/EcoQuiz";
import CarbonGuesser from "./games/CarbonGuesser/CarbonGuesser";
import PlantTicTacToe from "./games/Tic-Tac-Toe/TicTacToe";

/* ================= DASHBOARD COMPONENT ================= */
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
        minHeight: "100vh",
        background: "#f0f8f0",
      }}
    >
      {/* TITLE */}
      <h1 style={{ textAlign: "center" }}>🌿 CQuestER Dashboard</h1>

      {/* LOGOUT */}
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
        <button onClick={() => navigate("/")}>🏠 Home</button>
        <br />
        <button onClick={() => navigate("/leaderboard")}>🏆 Leaderboard</button>
        <br />
        <button onClick={() => navigate("/growth-gallery")}>🌿 Growth Gallery</button>
        <br />
        <button onClick={() => navigate("/profile")}>👤 Profile</button>
        <br />
        <button onClick={() => navigate("/redeem")}>🎁 Redeem</button>
        <br />
        <button onClick={() => navigate("/games")}>🎮 Mini Games</button>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 100,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT PANEL: AddTree / Plantation */}
        <div
          style={{
            flex: 1,
            minWidth: 400,
            background: "#e8f3e8",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* AddTree component already has redirect button to PlantationForm */}
          <AddTree />
        </div>

        {/* RIGHT PANEL: Tree List */}
        <div
          style={{
            flex: 2,
            minWidth: 500,
            background: "#e8f3e8",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
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

          {/* PLANTATION FORM */}
          <Route path="/plantation" element={<PlantationForm />} />

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
