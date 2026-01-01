import React, { useState } from "react";

const PlantTicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlantOne, setIsPlantOne] = useState(true); // true = 🌱, false = 🌿
  const [winner, setWinner] = useState(null);

  const plantEmoji = (value) => (value === "X" ? "🌱" : value === "O" ? "🌿" : "");

  const checkWinner = (b) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let line of lines) {
      const [a, b1, c] = line;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return; // ignore if filled or game over

    const newBoard = board.slice();
    newBoard[index] = isPlantOne ? "X" : "O";
    setBoard(newBoard);
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win);
    } else if (!newBoard.includes(null)) {
      setWinner("Draw");
    }
    setIsPlantOne(!isPlantOne);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlantOne(true);
    setWinner(null);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>🌱 Plant Tic-Tac-Toe 🌿</h2>
      {winner ? (
        <h3>
          {winner === "Draw" ? "It's a draw!" : `Winner: ${plantEmoji(winner)}`}
        </h3>
      ) : (
        <h3>Turn: {isPlantOne ? "🌱" : "🌿"}</h3>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 60px)",
          gridGap: "5px",
          justifyContent: "center",
          margin: "1rem auto",
        }}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: "60px",
              height: "60px",
              fontSize: "2rem",
              cursor: cell || winner ? "not-allowed" : "pointer",
              borderRadius: "5px",
              border: "2px solid #4CAF50",
              backgroundColor: "#f0fff0",
            }}
          >
            {plantEmoji(cell)}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          borderRadius: "5px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
        }}
      >
        Reset Game
      </button>
    </div>
  );
};

export default PlantTicTacToe;
