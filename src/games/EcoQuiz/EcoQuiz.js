import React, { useState, useEffect, useCallback, useRef } from "react";
import questions from "./questions";

const EcoQuiz = () => {
  // Check localStorage if quiz was already attempted
  const attemptedBefore = localStorage.getItem("ecoQuizAttempted") === "true";

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(attemptedBefore);
  const [started, setStarted] = useState(false); // Track if game started
  const [userAnswer, setUserAnswer] = useState("");
  const [timer, setTimer] = useState(5);

  const inputRef = useRef(null);

  // Move to next question
  const nextQuestion = useCallback(() => {
    setUserAnswer("");
    setTimer(5);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
      localStorage.setItem("ecoQuizAttempted", "true"); // Mark quiz as attempted
    }
  }, [current]);

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (
      userAnswer.trim().toLowerCase() ===
      questions[current].answer.toLowerCase()
    ) {
      setScore((prev) => prev + 1);
    }
    nextQuestion();
  }, [userAnswer, current, nextQuestion]);

  // Timer effect
  useEffect(() => {
    if (!started || finished) return;

    if (timer === 0) {
      handleSubmit(); // Auto-submit
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, finished, started, handleSubmit]);

  // Focus input
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [current, started]);

  // Start quiz (only works if not attempted)
  const handleStart = () => {
    if (!started && !attemptedBefore) setStarted(true);
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: "500px",
        margin: "auto",
        border: "2px solid #4CAF50",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h1>🧠 Eco Quiz</h1>

      {!started && !attemptedBefore ? (
        <>
          <h2>The game is about to start!</h2>
          <button
            onClick={handleStart}
            style={{
              padding: "0.8rem 1.5rem",
              fontSize: "1.1rem",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
            }}
          >
            Start Quiz
          </button>
        </>
      ) : finished || attemptedBefore ? (
        <h2>
          {attemptedBefore ? (
            <>
              ❌ You have already attempted this quiz.
              <br />
              Your score was: {score} / {questions.length}
            </>
          ) : (
            <>
              ✅ Quiz finished!
              <br />
              Your Score: {score} / {questions.length}
            </>
          )}
        </h2>
      ) : (
        <>
          <h3>Time Left: {timer}s</h3>
          <h3>{questions[current].question}</h3>

          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            style={{
              padding: "0.7rem",
              fontSize: "1.1rem",
              width: "80%",
              marginBottom: "1rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <br />

          <button
            onClick={handleSubmit}
            style={{
              padding: "0.7rem 1.5rem",
              fontSize: "1rem",
              borderRadius: "5px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
            }}
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
};

export default EcoQuiz;
