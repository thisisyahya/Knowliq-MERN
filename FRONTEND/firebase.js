import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 1. Paste your web app's Firebase configuration from your Firebase Console
 const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
 };
 
// 2. Initialize the Firebase Application instance
const app = initializeApp(firebaseConfig);

// 3. Initialize Firebase Authentication and export it
export const auth = getAuth(app);
