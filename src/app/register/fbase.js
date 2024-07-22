import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDtLEzzaXXtTtf9BBxFEpKKuP3AhdXAC1E",
    authDomain: "gudeokin-e4c75.firebaseapp.com",
    projectId: "gudeokin-e4c75",
    storageBucket: "gudeokin-e4c75.appspot.com",
    messagingSenderId: "407299078324",
    appId: "1:407299078324:web:6e080d0282c748b9123fe1",
    measurementId: "G-652MP274RD",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
export { app, auth };
