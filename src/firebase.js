import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC_Iu49QVLRgmI_UjUrp_v-FsUZIwKqug4",
  authDomain: "grest-otp.firebaseapp.com",
  projectId: "grest-otp",
  storageBucket: "grest-otp.appspot.com",
  messagingSenderId: "1031937795275",
  appId: "1:1031937795275:web:dae4721dd449ea434ea74e",
  measurementId: "G-7H0S4R7GBW",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

