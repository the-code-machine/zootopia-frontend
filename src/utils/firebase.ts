// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5hEAoyyvE1sKegk9m-e-9mCwdrJq8M8I",
  authDomain: "zootopia-6b375.firebaseapp.com",
  projectId: "zootopia-6b375",
  storageBucket: "zootopia-6b375.firebasestorage.app",
  messagingSenderId: "74973417647",
  appId: "1:74973417647:web:8d43fe5bcd6dc43a09c45a",
  measurementId: "G-XS0J4LHRG9",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) {
    console.log("Messaging not supported.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Your VAPID key from Firebase console
      });

      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
        return null;
      }
    } else {
      console.log("Unable to get permission to notify.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

export { app, messaging };
