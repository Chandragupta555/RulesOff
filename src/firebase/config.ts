import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiSebfVqphUy_rfaGYwdLJomDGe3Nh3v4",
  authDomain: "rulesoff.firebaseapp.com",
  projectId: "rulesoff",
  storageBucket: "rulesoff.firebasestorage.app",
  messagingSenderId: "607660601557",
  appId: "1:607660601557:web:fcfc73cbef204dc2efb25c",
  measurementId: "G-B9LMEHEMKB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
