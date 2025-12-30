// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRqogc7eSv6KH72FtoPTaVnjQdzwxLEzc",
  authDomain: "cquestr-d0926.firebaseapp.com",
  projectId: "cquestr-d0926",
  storageBucket: "cquestr-d0926.firebasestorage.app",
  messagingSenderId: "675226162402",
  appId: "1:675226162402:web:280730d4c804c458197abb"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
