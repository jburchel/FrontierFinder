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
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = firebase.database();
