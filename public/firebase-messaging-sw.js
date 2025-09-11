// public/firebase-messaging-sw.js
// This file must be in the public directory

importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// Use your Firebase configuration from the previous step
const firebaseConfig = {
  apiKey: "AIzaSyB5hEAoyyvE1sKegk9m-e-9mCwdrJq8M8I",
  authDomain: "zootopia-6b375.firebaseapp.com",
  projectId: "zootopia-6b375",
  storageBucket: "zootopia-6b375.firebasestorage.app",
  messagingSenderId: "74973417647",
  appId: "1:74973417647:web:8d43fe5bcd6dc43a09c45a",
  measurementId: "G-XS0J4LHRG9",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Customize the notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // Optional: Add an icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
