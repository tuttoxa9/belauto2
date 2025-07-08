import { initializeApp } from "firebase/app"
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
} from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { getAnalytics } from "firebase/analytics"

// ─── Firebase config ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDSCCGXMJCbZw1SYpwXy58K9iDhpveDzIA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "autobel-a6390.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "autobel-a6390",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "autobel-a6390.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "376315657256",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:376315657256:web:459f39d55bd4cb159ac91d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-93ZRW4X2PY",
}

// ─── Initialize core SDKs ────────────────────────────────────────
const app = initializeApp(firebaseConfig)

// One -- and only one -- call to initializeFirestore registers
// the "firestore" component, preventing the "Component … not registered"
// and "Service … is not available" errors.
const firestoreSettings = typeof window === "undefined"
  ? {} // server / node – default settings
  : { experimentalForceLongPolling: true } // browser – required in sandboxed iframes (Next.js)

const db = initializeFirestore(app, firestoreSettings)

// Optional: offline persistence (ignore "already enabled" errors from another tab)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {})
}

// If you use the local emulator suite while developing, uncomment:
// if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR === "true") {
//   connectFirestoreEmulator(db, "localhost", 8080)
// }

// ─── Other Firebase services ─────────────────────────────────────
export { db }
export const storage = getStorage(app)
export const auth = getAuth(app)

// Analytics works only in the browser.
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : undefined
