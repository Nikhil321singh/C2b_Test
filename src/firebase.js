import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyAzgXMq9YP-KkuS7HnPzbNJq5Ua30JuB0c",
authDomain: "fydox-app.firebaseapp.com",
projectId: "fydox-app",
storageBucket: "fydox-app.appspot.com",
messagingSenderId: "133025646403",
appId: "1:133025646403:web:45ffd22d38d90a724191f6",
measurementId: "G-4BKF6TEZR2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
