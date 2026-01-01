import React from "react";
import { Link } from "react-router-dom";

const GamesHome = () => {
  return (
    <div className="games-home" style={{ padding: "2rem", textAlign: "center" }}>
      <h1>🎮 Mini Games</h1>
      <p className="games-subtitle">
        Learn sustainability the fun way. Play, guess, and grow greener 🌱
      </p>

      <div
        className="games-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "2rem",
        }}
      >
        {/* Eco Quiz */}
        <div
          className="game-card"
          style={{
            padding: "1.5rem",
            border: "2px solid #4CAF50",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2>🧠 Eco Quiz</h2>
          <p>
            Test your knowledge with quick questions on sustainability and climate change.
          </p>
          <Link
            to="/games/quiz"
            className="play-btn"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#4CAF50",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Play
          </Link>
        </div>

        {/* Carbon Footprint Guesser */}
        <div
          className="game-card"
          style={{
            padding: "1.5rem",
            border: "2px solid #4CAF50",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2>🌍 Carbon Footprint Guesser</h2>
          <p>
            Guess the carbon emissions of everyday activities and learn the actual impact.
          </p>
          <Link
            to="/games/carbon-guesser"
            className="play-btn"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#4CAF50",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Play
          </Link>
        </div>

        {/* Plant Tic-Tac-Toe */}
        <div
          className="game-card"
          style={{
            padding: "1.5rem",
            border: "2px solid #4CAF50",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2>🌱 Plant Tic-Tac-Toe</h2>
          <p>
            Play a quick game of Tic-Tac-Toe with a plant twist! 🌱 vs 🌿
          </p>
          <Link
            to="/games/tic-tac-toe"
            className="play-btn"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.6rem 1.2rem",
              backgroundColor: "#4CAF50",
              color: "#fff",
              borderRadius: "5px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Play
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GamesHome;
