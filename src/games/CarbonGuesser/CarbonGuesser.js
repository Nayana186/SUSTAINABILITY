import React, { useState } from "react";
import activities from "./activities";

const CarbonGuesser = () => {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    setGuess("");
    setShowAnswer(false);
    setIndex(index + 1);
  };

  if (index >= activities.length) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1>🌍 Carbon Guesser</h1>
        <h2>Game Complete!</h2>
      </div>
    );
  }

  const current = activities[index];

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>🌍 Carbon Footprint Guesser</h1>
      <h3>{current.activity}</h3>

      {!showAnswer ? (
        <>
          <input
            type="number"
            placeholder="Your guess (kg CO₂)"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <br />
          <button onClick={() => setShowAnswer(true)}>Submit</button>
        </>
      ) : (
        <>
          <p>Your Guess: {guess} kg CO₂</p>
          <p>Actual Emission: {current.emission} kg CO₂</p>
          <button onClick={handleNext}>Next</button>
        </>
      )}
    </div>
  );
};

export default CarbonGuesser;
