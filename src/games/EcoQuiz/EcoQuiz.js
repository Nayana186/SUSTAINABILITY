import React, { useState, useEffect, useCallback, useRef } from "react";
import questions from "./questions";

import { db } from "../../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useUser } from "../../AuthProvider";

/* ================= CONFIG ================= */
const DEMO_MODE = true;

const EcoQuiz = () => {
  const { user } = useUser();

  /* ================= STATE ================= */
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [timer, setTimer] = useState(5);

  /* CREDIT PROGRESS */
  const [creditProgress, setCreditProgress] = useState(0);
  const [creditsEarned, setCreditsEarned] = useState(0);

  const inputRef = useRef(null);

  /* ================= QUIZ PROGRESS ================= */
  const quizProgress = ((current + 1) / questions.length) * 100;

  /* ================= REWARD CREDIT ================= */
  const rewardCredit = async () => {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      credits: increment(1),
    });

    setCreditsEarned((c) => c + 1);
  };

  /* ================= NEXT QUESTION ================= */
  const nextQuestion = useCallback(() => {
    setUserAnswer("");
    setTimer(5);

    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  }, [current]);

  /* ================= SUBMIT ================= */
  const handleSubmit = useCallback(() => {
    const isCorrect =
      userAnswer.trim().toLowerCase() ===
      questions[current].answer.toLowerCase();

    if (isCorrect) {
      setScore((s) => s + 1);

      setCreditProgress((prev) => {
        const updated = prev + 25;
        if (updated >= 100) {
          rewardCredit();
          return 0;
        }
        return updated;
      });
    }

    nextQuestion();
  }, [userAnswer, current, nextQuestion]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!started || finished) return;

    if (timer === 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, started, finished, handleSubmit]);

  /* ================= START / RESET ================= */
  const handleStart = () => {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setScore(0);
    setCreditProgress(0);
    setCreditsEarned(0);
  };

  /* ================= UI ================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "120px 30px",
        textAlign: "center",
        color: "#fff",
        background:
          "linear-gradient(rgba(12,35,12,0.8), rgba(12,35,12,0.8)), url('/forest.jpeg') center/cover no-repeat",
        fontFamily: "Poppins, Segoe UI, Arial",
      }}
    >
      <h1>🧠 Eco Quiz</h1>

      {/* ================= QUIZ PROGRESS BAR ================= */}
      {started && !finished && (
        <div style={{ maxWidth: "420px", margin: "16px auto" }}>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${quizProgress}%` }}
            />
          </div>
          <p style={{ fontSize: "14px", color: "#d9ffd9" }}>
            Question {current + 1} / {questions.length}
          </p>
        </div>
      )}

      {/* ================= CREDIT PROGRESS BAR ================= */}
      {started && !finished && (
        <div style={{ maxWidth: "420px", margin: "20px auto" }}>
          <span style={{ fontSize: "14px", color: "#b8ffb0" }}>
            🌱 Awareness → Credit
          </span>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${creditProgress}%` }}
            />
          </div>
        </div>
      )}

      {!started ? (
        <button className="quiz-btn" onClick={handleStart}>
          Start Quiz
        </button>
      ) : finished ? (
        <>
          <h2>✅ Quiz Completed</h2>
          <p>
            Score: <strong>{score}</strong> / {questions.length}
          </p>
          <p>Credits earned: 🌱 {creditsEarned}</p>

          <button className="quiz-btn" onClick={handleStart}>
            Play Again
          </button>
        </>
      ) : (
        <>
          <h3>⏳ Time Left: {timer}s</h3>
          <h3>{questions[current].question}</h3>

          <input
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer..."
            style={{
              padding: "10px",
              width: "80%",
              borderRadius: "8px",
              border: "none",
            }}
          />
          <br />

          <button className="quiz-btn" onClick={handleSubmit}>
            Submit
          </button>
        </>
      )}

      {/* ================= STYLES ================= */}
      <style>{`
        .progress-container {
          width: 100%;
          height: 14px;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          margin-top: 6px;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #1f7f43);
          transition: width 0.4s ease;
        }
        .quiz-btn {
          margin-top: 20px;
          padding: 10px 28px;
          border-radius: 25px;
          border: none;
          font-weight: 700;
          background: linear-gradient(145deg, #b7ff8a, #7ed957);
          color: #173d17;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(0,0,0,0.45);
        }
      `}</style>
    </div>
  );
};

export default EcoQuiz;
