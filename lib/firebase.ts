import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyCp1X8R2dp8L-W0jVJsw6LyNE5uRbl1zww",
  authDomain: "copynpaste-app-d4159.firebaseapp.com",
  projectId: "copynpaste-app-d4159",
  storageBucket: "copynpaste-app-d4159.firebasestorage.app",
  messagingSenderId: "151064134430",
  appId: "1:151064134430:web:23529907d89dbc990d7f0f",
  measurementId: "G-HMH99940H0",
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Analytics conditionally (only in browser environment)
let analytics = null
if (typeof window !== "undefined") {
  // Initialize analytics only on the client side
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)))
}

export { app, auth, db, storage, analytics }

