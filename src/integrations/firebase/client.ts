// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCbdQVdJXJev6dMo4BXRVjyqd4e1Dmdqk",
  authDomain: "hearme-adcf7.firebaseapp.com",
  projectId: "hearme-adcf7",
  storageBucket: "hearme-adcf7.firebasestorage.app",
  messagingSenderId: "952230851586",
  appId: "1:952230851586:web:ddd078abf52e532716a31b",
  measurementId: "G-696LHCX4PM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
