import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABP0YrAGyPPckKL95yuJxnoL0E-w0_T5Q",
  authDomain: "tempmailhub-57729.firebaseapp.com",
  projectId: "tempmailhub-57729",
  storageBucket: "tempmailhub-57729.firebasestorage.app",
  messagingSenderId: "609134161826",
  appId: "1:609134161826:web:946bb964747b97c1838cfb"
};

// Initialize Firebase App only once
let app;
let auth;
let googleProvider;

// Initialize Firebase function
const initializeFirebase = () => {
  if (!app) {
    // Check if any Firebase apps already exist
    const existingApps = getApps();
    if (existingApps.length === 0) {
      // No apps exist, create new one
      app = initializeApp(firebaseConfig);
    } else {
      // Use existing app
      app = existingApps[0];
    }
    
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Optional: Add custom parameters to the provider
    googleProvider.setCustomParameters({
      prompt: 'select_account' // Forces account selection even if user has one account
    });
    
    console.log('✅ Firebase initialized successfully');
  }
  return { auth, googleProvider };
};

// Export getter functions to ensure initialization
export const getFirebaseAuth = () => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

export const getGoogleProvider = () => {
  if (!googleProvider) {
    initializeFirebase();
  }
  return googleProvider;
};