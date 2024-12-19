// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-database.js";

// Your web app's Firebase configuration
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

export { database };
