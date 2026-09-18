// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQ9z313BaL0esqZ4Do1Ucq-0KtMYNsUVI",
  authDomain: "ps91-e5e3d.firebaseapp.com",
  projectId: "ps91-e5e3d",
  storageBucket: "ps91-e5e3d.firebasestorage.app",
  messagingSenderId: "337158055664",
  appId: "1:337158055664:web:fbba0b4f16df6c69d08435",
  measurementId: "G-PG9YFP26CN"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
