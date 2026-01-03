import React, { useState } from "react";
import activities from "./activities";

import { db } from "../../firebase";
import { useUser } from "../../AuthProvider";

import { doc, updateDoc, increment } from "firebase/firestore";



const REWARD_THRESHOLD = 20; // % error allowed
const CREDIT_PER_REWARD = 1;

const CarbonGuesser = () => {
  const { user } = useUser();

  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const [progress, setProgress] = useState(0);
  const [earnedCredits, setEarnedCredits] = useState(0);

  const current = activities[index];

  const checkAccuracy = async () => {
    const actual = current.emission;
    const errorPercent = Math.abs(guess - actual) / actual * 100;

    if (errorPercent <= REWARD_THRESHOLD) {
      setProgress((prev) => {
        const updated = prev + 40;

        if (updated >= 100) {
          rewardCredit();
          return 0;
        }
        return updated;
      });
    }

    setShowAnswer(true);
  };

  const rewardCredit = async () => {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      credits: increment(CREDIT_PER_REWARD),
    });

    setEarnedCredits((c) => c + CREDIT_PER_REWARD);
  };

  const handleNext = () => {
    setGuess("");
    setShowAnswer(false);
    setIndex(index + 1);
  };

  if (index >= activities.length) {
    return (
      <div className="carbon-complete">
        <h1>🌍 Carbon Guesser</h1>
        <h2>Game Complete!</h2>
        <p>Credits earned: <strong>{earnedCredits}</strong></p>
      </div>
    );
  }

  return (
    <div className="carbon-game">
      <h1>🌍 Carbon Footprint Guesser</h1>

      {/* Progress */}
      <div className="reward-box">
        <span>Awareness Progress</span>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h3>{current.activity}</h3>

      {!showAnswer ? (
        <>
          <input
            type="number"
            placeholder="Your guess (kg CO₂)"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button onClick={checkAccuracy}>Submit</button>
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
