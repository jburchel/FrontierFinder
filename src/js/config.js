// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Joshua Project API configuration
const JOSHUA_PROJECT_API_KEY = process.env.JOSHUA_PROJECT_API_KEY;
const JOSHUA_PROJECT_API_BASE_URL = 'https://api.joshuaproject.net/v1';

// Export configurations
export { 
    database,
    JOSHUA_PROJECT_API_KEY,
    JOSHUA_PROJECT_API_BASE_URL
};
