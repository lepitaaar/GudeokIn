import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDtLEzzaXXtTtf9BBxFEpKKuP3AhdXAC1E",
  authDomain: "gudeokin-e4c75.firebaseapp.com",
  projectId: "gudeokin-e4c75",
  storageBucket: "gudeokin-e4c75.appspot.com",
  messagingSenderId: "407299078324",
  appId: "1:407299078324:web:6e080d0282c748b9123fe1",
  measurementId: "G-652MP274RD"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};
export { app, messaging };

export const fetchToken = async () => {
    try {
        const fcmMessaging = await messaging();
        if (fcmMessaging) {
            const token = await getToken(fcmMessaging, {
                vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
            });
            return token;
        }
        return null;
    } catch (err) {
        console.error("An error occurred while fetching the token:", err);
        return null;
    }
};
