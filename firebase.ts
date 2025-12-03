import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAeIT-9agVZceY6vCXWg4deY2f-xnB7XRg",
  authDomain: "thegame-00001.firebaseapp.com",
  projectId: "thegame-00001",
  storageBucket: "thegame-00001.firebasestorage.app",
  messagingSenderId: "253527943042",
  appId: "1:253527943042:web:fc2896860ff7e576d7119b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);