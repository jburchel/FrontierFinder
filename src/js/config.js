// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBxcSoXRwFrUDsPUxvBvhABnLn7RlFKDvY",
    authDomain: "frontierfinder-b0f3c.firebaseapp.com",
    projectId: "frontierfinder-b0f3c",
    storageBucket: "frontierfinder-b0f3c.appspot.com",
    messagingSenderId: "1066490515699",
    appId: "1:1066490515699:web:6f1af16d8d8f8d8c4f4c4f",
    databaseURL: "https://frontierfinder-b0f3c-default-rtdb.firebaseio.com"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Joshua Project API configuration
const JOSHUA_PROJECT_API_KEY = '080e14ad747e'; // Replace this with your actual API key
const JOSHUA_PROJECT_API_BASE_URL = 'https://api.joshuaproject.net/v1';

// Export configurations
export { 
    app,
    database,
    JOSHUA_PROJECT_API_KEY,
    JOSHUA_PROJECT_API_BASE_URL
};
