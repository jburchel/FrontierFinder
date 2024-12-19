// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtzaibXTCspENsEVaN8XF5DkuizsjxVX4",
    authDomain: "crossover-people-finder.firebaseapp.com",
    projectId: "crossover-people-finder",
    databaseURL: "https://crossover-people-finder-default-rtdb.firebaseio.com",
    storageBucket: "crossover-people-finder.firebasestorage.app",
    messagingSenderId: "35563852058",
    appId: "1:35563852058:web:a4b89c5f0fedd06432dca3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Joshua Project API configuration
const JOSHUA_PROJECT_API_KEY = "080e14ad747e";
const JOSHUA_PROJECT_API_BASE_URL = 'https://api.joshuaproject.net/v1';

// Export configurations
export { 
    database,
    JOSHUA_PROJECT_API_KEY,
    JOSHUA_PROJECT_API_BASE_URL
};
