// Import Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getDatabase, ref, set, onValue, onDisconnect, runTransaction } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5s2tmowrrXjgtQ190P14xqpogE7GAVVo",
    authDomain: "taniaugcstudio-9394.firebaseapp.com",
    projectId: "taniaugcstudio-9394",
    storageBucket: "taniaugcstudio-9394.firebasestorage.app",
    messagingSenderId: "250831091181",
    appId: "1:250831091181:web:909576a057696101d623e4",
    databaseURL: "https://taniaugcstudio-9394-default-rtdb.europe-west1.firebasedatabase.app"
};

let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('Firebase initialized successfully:', app.name);
} catch (error) {
    console.error('Firebase initialization failed:', error);
    updateCounterDisplay('total-visits', 'N/A');
    updateCounterDisplay('active-users', 'N/A');
    throw error; // Stop execution on failure
}

// Helper function to update counter display
function updateCounterDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        console.log(`Updated ${elementId} to: ${value}`); // Debug UI update
    } else {
        console.error(`Element with ID "${elementId}" not found`);
    }
}

// Wait for DOM to be fully loaded
window.onload = function() {
    // Visited counter
    const visitsRef = ref(db, 'visits');
    runTransaction(visitsRef, (current) => {
        return (current || 0) + 1;
    })
    .then((result) => {
        if (result.committed) {
            console.log('Visits committed:', result.snapshot.val());
            updateCounterDisplay('total-visits', result.snapshot.val() || 0);
        }
    })
    .catch((error) => {
        console.error('Error updating visits:', error);
        updateCounterDisplay('total-visits', 'N/A');
    });
    
    // Watching counter
    const activeUsersRef = ref(db, 'activeUsers');
    const sessionKey = `session_${Date.now()}_${Math.random().toString().replace('.', '_')}`; // Replace . with _
    set(ref(db, `activeUsers/${sessionKey}`), { active: true })
    .then(() => console.log('Active user set:', sessionKey))
    .catch((error) => console.error('Error setting active user:', error));
    onDisconnect(ref(db, `activeUsers/${sessionKey}`)).remove()
    .then(() => console.log('onDisconnect set for:', sessionKey))
    .catch((error) => console.error('Error setting onDisconnect:', error));
    
    // Update watching count in real-time
    onValue(activeUsersRef, (snapshot) => {
        const count = snapshot.size; // Use snapshot.size
        console.log('Active users count:', count);
        updateCounterDisplay('active-users', count || 0);
    }, (error) => {
        console.error('Error fetching active users:', error);
        updateCounterDisplay('active-users', 'N/A');
    });
};