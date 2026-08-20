// Firebase bootstrap for the browser SDK loaded from public/index.html.
// Business data uses Cloud Firestore, host credentials use Firebase Auth,
// and venue photos use Cloud Storage.

let servicesPromise = null;

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || undefined,
// };

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  // apiKey: "AIzaSyDzlJHmlA1IFIBL-hPuOB4g85bj0V2TE3U",
  // authDomain: "mixedtables.firebaseapp.com",
  // projectId: "mixedtables",
  // storageBucket: "mixedtables.firebasestorage.app",
  // messagingSenderId: "392324363162",
  // appId: "1:392324363162:web:42fea8b940936f6ab5c023"


  apiKey: "AIzaSyDdXVwF-qlr36ODm-r9Nsjid7yUKbjbjlo",
  authDomain: "mixedtables-101ed.firebaseapp.com",
  projectId: "mixedtables-101ed",
  storageBucket: "mixedtables-101ed.firebasestorage.app",
  messagingSenderId: "310038267138",
  appId: "1:310038267138:web:0109c0713d3e0fcb15ae1b"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
function waitForSdk() {
  if (window.firebase) return Promise.resolve(window.firebase);
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.firebase) {
        window.clearInterval(timer);
        resolve(window.firebase);
      } else if (attempts >= 100) {
        window.clearInterval(timer);
        reject(new Error("Firebase SDK konnte nicht geladen werden."));
      }
    }, 50);
  });
}

function assertConfig() {
  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];
  const missing = required.filter((key) => !firebaseConfig[key]);
  if (missing.length) {
    throw new Error(
      `Firebase ist nicht konfiguriert. Fehlende Werte: ${missing.join(", ")}. ` +
      "Bitte die REACT_APP_FIREBASE_* Werte in .env eintragen.",
    );
  }
}

export function initFirebase() {
  if (!servicesPromise) {
    servicesPromise = (async () => {
      assertConfig();
      const firebase = await waitForSdk();

      const mainApp =
        firebase.apps.find((app) => app.name === "[DEFAULT]") ||
        firebase.initializeApp(firebaseConfig);
      const guestApp =
        firebase.apps.find((app) => app.name === "mischtisch-guests") ||
        firebase.initializeApp(firebaseConfig, "mischtisch-guests");

      const auth = mainApp.auth();
      const guestAuth = guestApp.auth();
      await Promise.all([
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL),
        guestAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL),
      ]);

      return {
        firebase,
        app: mainApp,
        db: mainApp.firestore(),
        auth,
        storage: mainApp.storage(),
        guestApp,
        guestDb: guestApp.firestore(),
        guestAuth,
      };
    })();
  }
  return servicesPromise;
}

export async function getFirebaseServices() {
  return initFirebase();
}

export async function waitForHostAuth() {
  const { auth } = await getFirebaseServices();
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

export async function ensureGuestUser() {
  const { guestAuth } = await getFirebaseServices();
  if (guestAuth.currentUser) return guestAuth.currentUser;
  const credential = await guestAuth.signInAnonymously();
  return credential.user;
}
