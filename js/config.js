// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Joshua Project API configuration
const JOSHUA_PROJECT_API_KEY = process.env.JOSHUA_PROJECT_API_KEY;
const JOSHUA_PROJECT_API_BASE_URL = 'https://api.joshuaproject.net/v1';
