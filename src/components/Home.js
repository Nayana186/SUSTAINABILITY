import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth and redirect to login
    navigate("/login");
  };

  return (
    <div
  className="home-container"
  style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/forest.jpg)` }}
>

      {/* ================= NAVBAR ================= */}
      <div className="home-navbar">
        <div className="home-logo">CQ</div>
        <div className="home-nav-links">
          <Link to="/" className="nav-link">HOME</Link>
          <Link to="/trees" className="nav-link">ADD TREES</Link>
          <Link to="/growth-gallery" className="nav-link">GROWTH GALLERY</Link>
          <Link to="/leaderboard" className="nav-link">LEADERBOARD</Link>
          <Link to="/redeem" className="nav-link">REDEEM</Link>
          <Link to="/games" className="nav-link">GAME</Link>
          <Link to="/profile" className="nav-link">PROFILE</Link>
        </div>
        <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
      </div>

      {/* ================= ABOUT ================= */}
      <div
        className="home-about"
        style={{
          maxWidth: "600px",
          backgroundColor: "white", // white overlay
          color: "#1b5e20", // dark green text
          padding: "40px 30px",
          borderRadius: "12px",
          textAlign: "center",
          lineHeight: "1.8",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", marginBottom: "20px" }}>ABOUT</h2>
        <p style={{ fontSize: "16px" }}>
          Cquester is a simple digital platform that lets users log the trees
          they plant, identify species, and calculate the CO₂ absorbed over
          time. The app visualizes total carbon offset, shows yearly growth, and
          converts CO₂ values into relatable equivalents like avoided car
          emissions. A community leaderboard encourages engagement through
          gamified climate action, making carbon sequestration visible,
          measurable, and motivating for everyone.
        </p>
      </div>
    </div>
  );
}
