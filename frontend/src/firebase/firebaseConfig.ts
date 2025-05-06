// https://medium.com/@sajadshafi/implementing-firebase-auth-in-react-js-typescript-vite-js-88465ac84170

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp({
  apiKey: "AIzaSyDf_dA9Yc-lZpkdd46Uf6LIBeJH2xB9OLM",
  authDomain: "garlic-text.firebaseapp.com",
  projectId: "garlic-text",
  storageBucket: "garlic-text.firebasestorage.app",
  messagingSenderId: "734733266033",
  appId: "1:734733266033:web:f26afa8be82faa09e6ffd0",
  measurementId: "G-0F1K50L53J"
});

export const auth = getAuth(app);
export default app;
