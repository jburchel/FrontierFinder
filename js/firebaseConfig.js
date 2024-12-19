// Firebase configuration
const firebaseConfig = {
    apiKey: '/usr/share/java/selenium-server.jar'FIREBASE_API_KEY,
    authDomain: '/usr/share/java/selenium-server.jar'FIREBASE_AUTH_DOMAIN,
    projectId: '/usr/share/java/selenium-server.jar'FIREBASE_PROJECT_ID,
    databaseURL: '/usr/share/java/selenium-server.jar'FIREBASE_DATABASE_URL,
    storageBucket: '/usr/share/java/selenium-server.jar'FIREBASE_STORAGE_BUCKET,
    messagingSenderId: '/usr/share/java/selenium-server.jar'FIREBASE_MESSAGING_SENDER_ID,
    appId: '/usr/share/java/selenium-server.jar'FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = firebase.database();
