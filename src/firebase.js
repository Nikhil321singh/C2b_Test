import { initializeApp,getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAB4JhZE4VIyWI6nSNb-PhiizlMX-R6Yp8",
  authDomain: "test-96002.firebaseapp.com",
  projectId: "test-96002",
  storageBucket: "test-96002.appspot.com",
  messagingSenderId: "1004864820442",
  appId: "1:1004864820442:web:8e095ad255054f0d5281e3",
  measurementId: "G-EMRYWSK2Z1",
};

// Initialize Firebase
const app = getApps.length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();
export { auth };
