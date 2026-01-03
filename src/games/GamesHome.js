import React from "react";
import { Link } from "react-router-dom";
import "./games.css";

const GamesHome = () => {
  return (
    <>
      {/* 🔝 HEADER */}
      <header className="games-header">
        <div className="logo-section">
          <div className="cq-logo">CQ</div>
          <span className="site-name">CQUESTER</span>
        </div>

        <div className="menu-icon">☰</div>
      </header>

      {/* 🎮 GAMES PAGE */}
      <div
        className="games-home"
        style={{ backgroundImage: "url(/forest.jpg)" }}
      >
        <h1>🎮 Mini Games</h1>

        <p className="games-subtitle">
          Learn sustainability the fun way. Play, guess, and grow greener 🌱
        </p>

        <div className="games-grid">
          {/* Eco Quiz */}
          <div className="game-card">
            <h2>🧠 Eco Quiz</h2>
            <p>
              Test your knowledge with quick questions on sustainability and
              climate change.
            </p>
            <Link to="/games/quiz" className="play-btn">
              Play
            </Link>
          </div>

          {/* Carbon Footprint Guesser */}
          <div className="game-card">
            <h2>🌍 Carbon Footprint Guesser</h2>
            <p>
              Guess the carbon emissions of everyday activities and learn the
              actual impact.
            </p>
            <Link to="/games/carbon-guesser" className="play-btn">
              Play
            </Link>
          </div>

          {/* Plant Tic-Tac-Toe */}
          <div className="game-card">
            <h2>🌱 Plant Tic-Tac-Toe</h2>
            <p>
              Play a quick game of Tic-Tac-Toe with a plant twist! 🌱 vs 🌿
            </p>
            <Link to="/games/tic-tac-toe" className="play-btn">
              Play
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default GamesHome;
