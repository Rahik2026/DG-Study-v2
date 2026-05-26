import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyAz9uK-g0eqnZGmPhYBNmivLN_gtZEBXQE",

  authDomain: "dg-study-v2.firebaseapp.com",

  projectId: "dg-study-v2",

  storageBucket: "dg-study-v2.firebasestorage.app",

  messagingSenderId: "28094509804",

  appId: "1:28094509804:web:b12a93329fc4aba460abc9"

};


// Only initialize if we have a real API key (skip during SSR build)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '';

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // During build/SSR without env vars, create a dummy that won't crash
  // The actual app will only run on the client with real env vars
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
}

export { app, auth, db, isConfigured };
export default app;
