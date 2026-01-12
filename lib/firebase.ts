import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBT3ss3qomX3EWIBo2dpvO--05xyLDyOrE",
  authDomain: "ink-app-781ec.firebaseapp.com",
  projectId: "ink-app-781ec",
  storageBucket: "ink-app-781ec.firebasestorage.app",
  messagingSenderId: "462790420170",
  appId: "1:462790420170:web:52bab61b7647ab78aaf633",
  measurementId: "G-TV360KRNLT",
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);
