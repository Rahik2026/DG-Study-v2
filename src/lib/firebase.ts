import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAz9uK-g0eqnZGmPhYBNmivLN_gtZEBXQE",
  authDomain: "dg-study-v2.firebaseapp.com",
  projectId: "dg-study-v2",
  storageBucket: "dg-study-v2.firebasestorage.app",
  messagingSenderId: "28094509804",
  appId: "1:28094509804:web:b12a93329fc4aba460abc9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
