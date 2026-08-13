import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBFqkGrMDjtN0tbmmI0Ee5-ldhugNo83AQ",
  authDomain: "aikiddo.firebaseapp.com",
  projectId: "aikiddo",
  storageBucket: "aikiddo.firebasestorage.app",
  messagingSenderId: "24475477981",
  appId: "1:24475477981:web:739efba345cba1b792b834"
};

// Safe initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
};
export type { FirebaseUser };

