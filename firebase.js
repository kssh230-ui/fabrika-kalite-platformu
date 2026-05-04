import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD78q0C4Lt_pOxlEjUEUKka111iV3ZNQhA",
  authDomain: "fabrika-kalite-final.firebaseapp.com",
  projectId: "fabrika-kalite-final",
  storageBucket: "fabrika-kalite-final.firebasestorage.app",
  messagingSenderId: "691304684473",
  appId: "1:691304684473:web:190e281c65d35dbba6b468",
  measurementId: "G-EF93YCW17D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);