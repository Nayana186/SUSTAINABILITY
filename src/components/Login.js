import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loginMode, setLoginMode] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (loginMode) {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, pw);

        await setDoc(doc(db, "users", cred.user.uid), {
          displayName: email.split("@")[0],
          email,
          points: 0,
          createdAt: serverTimestamp(),
        });
      }

      navigate("/");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div
      className="container"
      style={{
        background: "url('/background.jpg') center / cover no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="title">CQuester</div>

      <div className="login-box">
        <h2>{loginMode ? "LOGIN" : "SIGN UP"}</h2>

        <div className="label">EMAIL :</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="label">PASSWORD :</div>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {loginMode ? "LOGIN" : "CREATE ACCOUNT"}
        </button>

        <p
  className="auth-toggle"
  onClick={() => setLoginMode(!loginMode)}
>
  {loginMode
    ? "New here? Create an account"
    : "Already have an account? Login"}
</p>

      </div>
    </div>
  );
}
