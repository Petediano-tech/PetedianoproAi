
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "petediano-pro",
  appId: "1:1091643597250:web:c07b25c79882ae4ee8365b",
  storageBucket: "petediano-pro.appspot.com",
  apiKey: "REDACTED",
  authDomain: "petediano-pro.firebaseapp.com",
  messagingSenderId: "1091643597250",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
