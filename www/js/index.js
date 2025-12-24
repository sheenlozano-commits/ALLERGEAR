// ============================================
// FIREBASE CONFIGURATION
// ============================================
console.log("=== INITIALIZING FIREBASE ===");

// DEBUG: CORRECT Firebase configuration for YOUR project "allergy-faca1"
const firebaseConfig = {
    apiKey: "AIzaSyCBACdOMYZE2bI7ZhAzSyw1OZzzgldS4uM",
    authDomain: "allergy-faca1.firebaseapp.com",
    projectId: "allergy-faca1",
    storageBucket: "allergy-faca1.appspot.com",
    messagingSenderId: "12953098788",
    appId: "1:12953098788:android:3f1a72eaec80da2ae116b1"
};

console.log("Firebase Config Loaded:", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
let db = null;

// Check if Firebase SDK is loaded
if (typeof firebase !== 'undefined') {
    console.log("Firebase SDK is loaded successfully");
    
    try {
        // Initialize Firebase
        console.log("Attempting to initialize Firebase...");
        const app = firebase.initializeApp(firebaseConfig);
        console.log("Firebase app initialized:", app.name);
        
        // Initialize Firestore
        db = firebase.firestore();
        console.log("Firestore initialized");
        
        // Enable offline persistence
        db.enablePersistence()
            .then(() => {
                console.log("Firebase persistence enabled");
            })
            .catch((err) => {
                console.warn("Firebase persistence failed:", err.code, err.message);
            });
        
        // Test Firestore connection
        testFirestoreConnection();
        
    } catch (error) {
        console.error("Firebase initialization error:", error);
        alert("Firebase Error: " + error.message);
        db = null;
    }
} else {
    console.error("Firebase SDK not loaded! Check your script tags.");
    alert("Firebase SDK not loaded. Please check console.");
    db = null;
}

// ============================================
// DEBUG FUNCTIONS
// ============================================

async function testFirestoreConnection() {
    if (!db) {
        console.error("Cannot test: Firestore not initialized");
        return false;
    }
    
    console.log("Testing Firestore connection...");
    
    try {
        // Try to write a test document
        console.log("Attempting to write test document...");
        const testRef = await db.collection('testConnection').add({
            test: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: "Test connection from AllerGuard"
        });
        
        console.log("✓ Test document written with ID:", testRef.id);
        
        // Try to read it back
        console.log("Attempting to read test document...");
        const doc = await testRef.get();
        
        if (doc.exists) {
            console.log("✓ Test document read successfully:", doc.data());
            
            // Delete the test document
            await testRef.delete();
            console.log("✓ Test document cleaned up");
            
            // Add a success indicator to the page
            const successDiv = document.createElement('div');
            successDiv.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            successDiv.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                Firestore Connected! Project: ${firebaseConfig.projectId}
            `;
            document.body.appendChild(successDiv);
            
            setTimeout(() => successDiv.remove(), 5000);
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error("✗ Firestore connection test FAILED:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        
        // Add an error indicator to the page
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 300px;
        `;
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            Firestore Error: ${error.code || 'Unknown'}
            <br><small>${error.message || 'Check console'}</small>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 10000);
        
        return false;
    }
}

// Add a test button to your emergency section
function addDebugButton() {
    const debugButton = document.createElement('button');
    debugButton.innerHTML = '<i class="fas fa-bug"></i> Debug Firestore';
    debugButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 50px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    debugButton.onclick = testFirestoreConnection;
    document.body.appendChild(debugButton);
}

// ============================================
// FIREBASE FUNCTIONS (UPDATED WITH DEBUGGING)
// ============================================

async function saveLogToFirestore(logEntry) {
    console.log("Attempting to save log to Firestore:", logEntry);
    
    if (!db) {
        console.error("Firestore not available");
        return null;
    }
    
    try {
        // Prepare data for Firestore
        const firestoreData = {
            allergen: logEntry.allergen,
            date: logEntry.date,
            symptoms: logEntry.symptoms,
            severity: logEntry.severity,
            notes: logEntry.notes || '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            synced: true,
            appVersion: "1.0.0"
        };
        
        console.log("Saving to Firestore:", firestoreData);
        
        const docRef = await db.collection('logEntries').add(firestoreData);
        console.log("✓ Log saved to Firestore with ID:", docRef.id);
        
        // Show success notification
        showNotification(`Log saved to Firestore! ID: ${docRef.id}`, 'success');
        
        return docRef.id;
        
    } catch (error) {
        console.error("✗ Error saving to Firestore:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        showNotification(`Firestore Error: ${error.code || 'Unknown'}`, 'error');
        
        return null;
    }
}

async function loadLogsFromFirestore() {
    if (!db) {
        console.log("Firestore not available");
        return [];
    }
    
    try {
        console.log("Loading logs from Firestore...");
        const snapshot = await db.collection('logEntries')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        console.log(`Found ${snapshot.size} logs in Firestore`);
        
        const firestoreLogs = [];
        snapshot.forEach(doc => {
            firestoreLogs.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return firestoreLogs;
        
    } catch (error) {
        console.error("Error loading from Firestore:", error);
        return [];
    }
}

// ============================================
// NOTIFICATION HELPER
// ============================================

function showNotification(message, type = 'info') {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    const icon = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    }[type];
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icon}" style="font-size: 1.2em"></i>
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Add CSS for animations
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// ORIGINAL APP CODE CONTINUES BELOW
// ============================================

// Data arrays
const allergens = [
    { 
        id: 1, 
        name: "Peanuts", 
        icon: "fas fa-peanut", 
        symptoms: ["Swelling of lips/face", "Hives or rash", "Difficulty breathing", "Tightening of throat", "Digestive issues"],
        foods: ["Peanut butter", "Peanut oil", "Mixed nuts", "Some Asian sauces", "Some baked goods"],
        tips: ["Always read food labels", "Carry an epinephrine auto-injector", "Inform restaurants about allergy", "Avoid foods with 'may contain' warnings"],
        crossReactivity: "People with peanut allergies may also react to other legumes like soybeans, peas, and lentils, though this is not common.",
        severity: "high"
    },
    { 
        id: 2, 
        name: "Tree Nuts", 
        icon: "fas fa-acorn", 
        symptoms: ["Itching or tingling in mouth", "Swelling of face/throat", "Abdominal pain", "Nausea or vomiting", "Shortness of breath"],
        foods: ["Almonds", "Walnuts", "Cashews", "Pistachios", "Hazelnuts"],
        tips: ["Be cautious with nut oils", "Watch for cross-contamination", "Carry emergency medication", "Consider medical ID bracelet"],
        crossReactivity: "Cross-reactivity among tree nuts is common. If allergic to one tree nut, there's a higher chance of being allergic to others.",
        severity: "high"
    },
    { 
        id: 3, 
        name: "Milk", 
        icon: "fas fa-cheese", 
        symptoms: ["Hives or rash", "Digestive issues", "Wheezing or coughing", "Vomiting", "Colic (in infants)"],
        foods: ["Cheese", "Yogurt", "Butter", "Ice cream", "Cream-based sauces"],
        tips: ["Look for dairy-free alternatives", "Check labels for casein/whey", "Be cautious with baked goods", "Consider calcium supplements"],
        crossReactivity: "Cow's milk allergy may cross-react with milk from other mammals like goats or sheep in about 90% of cases.",
        severity: "medium"
    },
    { 
        id: 4, 
        name: "Eggs", 
        icon: "fas fa-egg", 
        symptoms: ["Skin rash or hives", "Nasal congestion", "Digestive issues", "Coughing or wheezing", "Anaphylaxis (rare)"],
        foods: ["Mayonnaise", "Baked goods", "Pasta", "Some processed meats", "Salad dressings"],
        tips: ["Look for egg-free alternatives", "Check vaccine ingredients", "Be cautious with baked goods", "Inform healthcare providers"],
        crossReactivity: "Some people allergic to chicken eggs may also react to eggs from other birds like ducks, geese, or quail.",
        severity: "medium"
    },
    { 
        id: 5, 
        name: "Wheat", 
        icon: "fas fa-bread-slice", 
        symptoms: ["Hives or rash", "Nausea or vomiting", "Difficulty breathing", "Nasal congestion", "Anaphylaxis (rare)"],
        foods: ["Bread", "Pasta", "Cereal", "Beer", "Soy sauce"],
        tips: ["Try gluten-free alternatives", "Read labels carefully", "Be cautious with processed foods", "Consider nutritionist consultation"],
        crossReactivity: "Wheat allergy may cross-react with other grains like barley or rye due to similar proteins.",
        severity: "medium"
    },
    { 
        id: 6, 
        name: "Soy", 
        icon: "fas fa-seedling", 
        symptoms: ["Tingling in mouth", "Hives or itching", "Swelling of lips/face", "Wheezing or runny nose", "Abdominal pain"],
        foods: ["Tofu", "Soy milk", "Edamame", "Soy sauce", "Processed foods"],
        tips: ["Look for soy-free alternatives", "Check Asian cuisine ingredients", "Be cautious with vegetable oils", "Read processed food labels"],
        crossReactivity: "Soy may cross-react with other legumes like peanuts, though this is not common (less than 10% of cases).",
        severity: "low"
    },
    { 
        id: 7, 
        name: "Fish", 
        icon: "fas fa-fish", 
        symptoms: ["Hives or rash", "Nausea or vomiting", "Diarrhea", "Dizziness", "Difficulty breathing"],
        foods: ["Salmon", "Tuna", "Cod", "Fish sauce", "Surimi"],
        tips: ["Be cautious in seafood restaurants", "Check Worcestershire sauce", "Avoid fish oil supplements", "Inform restaurants about allergy"],
        crossReactivity: "Cross-reactivity among fish species is common. If allergic to one type of fish, you're likely allergic to others.",
        severity: "high"
    },
    { 
        id: 8, 
        name: "Shellfish", 
        icon: "fas fa-crab", 
        symptoms: ["Swelling of lips/face", "Wheezing", "Abdominal pain", "Diarrhea", "Dizziness"],
        foods: ["Shrimp", "Lobster", "Crab", "Crayfish", "Scallops"],
        tips: ["Avoid seafood restaurants", "Check Asian cuisine carefully", "Be cautious with iodine (misconception)", "Carry emergency medication"],
        crossReactivity: "Cross-reactivity is common within crustacean shellfish (shrimp, crab, lobster) but less common with mollusks (clams, oysters).",
        severity: "high"
    }
];

// Symptom data
const symptoms = [
    { id: 1, name: "Hives or Rash", severity: "low", allergens: [1, 3, 5, 7] },
    { id: 2, name: "Swelling (Lips/Face)", severity: "medium", allergens: [1, 2, 8] },
    { id: 3, name: "Itching or Tingling", severity: "low", allergens: [2, 6] },
    { id: 4, name: "Nausea/Vomiting", severity: "medium", allergens: [2, 5, 7] },
    { id: 5, name: "Abdominal Pain", severity: "medium", allergens: [2, 3, 8] },
    { id: 6, name: "Difficulty Breathing", severity: "high", allergens: [1, 5, 7] },
    { id: 7, name: "Wheezing/Coughing", severity: "high", allergens: [3, 8] },
    { id: 8, name: "Dizziness", severity: "high", allergens: [7] },
    { id: 9, name: "Nasal Congestion", severity: "low", allergens: [4] },
    { id: 10, name: "Digestive Issues", severity: "medium", allergens: [3, 4] },
    { id: 11, name: "Tightening of Throat", severity: "high", allergens: [1] },
    { id: 12, name: "Diarrhea", severity: "medium", allergens: [7, 8] }
];

// Log entries data
let logEntries = [
    { 
        id: 1, 
        date: "2023-10-15", 
        allergen: "Peanuts", 
        symptoms: ["Hives or Rash", "Swelling (Lips/Face)"], 
        severity: "moderate",
        notes: "Ate cookies that contained peanuts"
    },
    { 
        id: 2, 
        date: "2023-10-10", 
        allergen: "Milk", 
        symptoms: ["Digestive Issues"], 
        severity: "mild",
        notes: "Drank milk by mistake"
    },
    { 
        id: 3, 
        date: "2023-10-05", 
        allergen: "Shellfish", 
        symptoms: ["Difficulty Breathing", "Dizziness"], 
        severity: "severe",
        notes: "Emergency room visit required"
    },
    { 
        id: 4, 
        date: "2023-09-28", 
        allergen: "Wheat", 
        symptoms: ["Nausea/Vomiting", "Hives or Rash"], 
        severity: "moderate",
        notes: "Bread at restaurant likely contaminated"
    }
];

// DOM Elements
let selectedSymptoms = [];
const allergenGrid = document.getElementById('allergenGrid');
const symptomOptions = document.getElementById('symptomOptions');
const selectedCount = document.getElementById('selectedCount');
const selectedList = document.getElementById('selectedList');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const analysisResult = document.getElementById('analysisResult');
const logEntriesContainer = document.getElementById('logEntries');
const logForm = document.getElementById('logForm');
const allergenSearch = document.getElementById('allergenSearch');
const allergenDetailModal = document.getElementById('allergenDetailModal');
const closeModal = document.getElementById('closeModal');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// ============================================
// UPDATED HANDLE LOG SUBMIT FUNCTION
// ============================================

async function handleLogSubmit(e) {
    e.preventDefault();
    
    console.log("Log form submitted");
    
    // Get form values
    const date = document.getElementById('logDate').value;
    const allergen = document.getElementById('logAllergen').value;
    const severity = document.querySelector('input[name="severity"]:checked')?.value;
    const notes = document.getElementById('logNotes').value;
    
    // Get selected symptoms
    const selectedSymptoms = Array.from(document.querySelectorAll('#logSymptoms input:checked'))
        .map(checkbox => checkbox.value);
    
    // Validate
    if (!allergen) {
        alert('Please select an allergen.');
        return;
    }
    
    if (!severity) {
        alert('Please select reaction severity.');
        return;
    }
    
    if (selectedSymptoms.length === 0) {
        alert('Please select at least one symptom.');
        return;
    }
    
    // Create new log entry
    const newLog = {
        id: Date.now(), // Use timestamp for unique ID
        date: date,
        allergen: allergen,
        symptoms: selectedSymptoms,
        severity: severity,
        notes: notes
    };
    
    console.log("New log entry:", newLog);
    
    // Save to Firestore
    console.log("Attempting to save to Firestore...");
    const firestoreId = await saveLogToFirestore(newLog);
    
    if (firestoreId) {
        newLog.firestoreId = firestoreId;
        console.log("Firestore save successful");
    } else {
        console.log("Firestore save failed, saving locally only");
        showNotification("Saving locally (Firestore failed)", 'error');
    }
    
    // Add to local log entries
    logEntries.unshift(newLog);
    
    // Update UI
    renderLogEntries();
    updateLogStats();
    
    // Reset form
    logForm.reset();
    document.getElementById('logDate').valueAsDate = new Date();
    
    console.log("Log entry saved successfully");
}

// ============================================
// ORIGINAL APP FUNCTIONS (NO CHANGES)
// ============================================

// Initialize the app
function initApp() {
    console.log("Initializing AllerGuard app...");
    
    // Add debug button
    addDebugButton();
    
    // Set today's date as default in log form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;
    
    // Render initial data
    renderAllergens();
    renderSymptoms();
    renderLogEntries();
    updateLogStats();
    populateAllergenSelect();
    populateLogSymptoms();
    
    // Add event listeners
    setupEventListeners();
    
    // Show home section by default
    showSection('home');
    
    // Load logs from Firestore
    loadInitialData();
    
    console.log("App initialized successfully");
}

// Load initial data from Firestore
async function loadInitialData() {
    if (db) {
        console.log("Loading initial data from Firestore...");
        const firestoreLogs = await loadLogsFromFirestore();
        if (firestoreLogs.length > 0) {
            console.log(`Loaded ${firestoreLogs.length} logs from Firestore`);
            // Merge with local logs
            firestoreLogs.forEach(log => {
                if (!logEntries.find(l => l.firestoreId === log.id)) {
                    logEntries.push(log);
                }
            });
            renderLogEntries();
            updateLogStats();
        }
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu if open
            document.querySelector('nav ul').classList.remove('show');
        });
    });
    
    // Menu toggle for mobile
    menuToggle.addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('show');
    });
    
    // Symptom checker
    analyzeBtn.addEventListener('click', analyzeSymptoms);
    clearBtn.addEventListener('click', clearSelectedSymptoms);
    
    // Log form - UPDATED to use new function
    logForm.addEventListener('submit', (e) => handleLogSubmit(e));
    
    // Search
    allergenSearch.addEventListener('input', filterAllergens);
    
    // Modal
    closeModal.addEventListener('click', () => {
        allergenDetailModal.classList.remove('show');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === allergenDetailModal) {
            allergenDetailModal.classList.remove('show');
        }
    });
    
    // Emergency call button
    document.getElementById('callEmergency').addEventListener('click', () => {
        if (confirm('Call emergency services? This will open your phone dialer.')) {
            window.open('tel:911');
        }
    });
    
    // Add contact buttons
    document.getElementById('addAllergist').addEventListener('click', () => {
        const number = prompt('Enter your allergist\'s phone number:');
        if (number) {
            document.getElementById('allergistNumber').textContent = number;
            localStorage.setItem('allergistNumber', number);
        }
    });
    
    document.getElementById('addEmergencyContact').addEventListener('click', () => {
        const number = prompt('Enter emergency contact phone number:');
        if (number) {
            document.getElementById('emergencyContact').textContent = number;
            localStorage.setItem('emergencyContact', number);
        }
    });
    
    // Load saved contacts
    const savedAllergist = localStorage.getItem('allergistNumber');
    const savedEmergencyContact = localStorage.getItem('emergencyContact');
    if (savedAllergist) document.getElementById('allergistNumber').textContent = savedAllergist;
    if (savedEmergencyContact) document.getElementById('emergencyContact').textContent = savedEmergencyContact;
    
    // CTA buttons in hero section
    document.querySelectorAll('.cta-buttons .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sectionId = btn.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
        });
    });
}

// Show specific section
function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render allergens to the grid
function renderAllergens(filteredAllergens = allergens) {
    allergenGrid.innerHTML = '';
    
    if (filteredAllergens.length === 0) {
        allergenGrid.innerHTML = '<p class="no-results">No allergens found matching your search.</p>';
        return;
    }
    
    filteredAllergens.forEach(allergen => {
        const allergenCard = document.createElement('div');
        allergenCard.className = 'allergen-card';
        allergenCard.dataset.id = allergen.id;
        
        const severityClass = `severity severity-${allergen.severity}`;
        
        allergenCard.innerHTML = `
            <div class="allergen-icon">
                <i class="${allergen.icon}"></i>
            </div>
            <h4>${allergen.name}</h4>
            <div class="${severityClass}" style="margin-bottom: 10px;">${allergen.severity.toUpperCase()} RISK</div>
            <p>Common symptoms: ${allergen.symptoms.slice(0, 2).join(', ')}...</p>
            <div class="allergen-tags">
                ${allergen.symptoms.slice(0, 3).map(symptom => 
                    `<span class="allergen-tag">${symptom.split(' ')[0]}</span>`
                ).join('')}
            </div>
        `;
        
        allergenCard.addEventListener('click', () => showAllergenDetail(allergen.id));
        allergenGrid.appendChild(allergenCard);
    });
}

// Render symptoms to the symptom checker
function renderSymptoms() {
    symptomOptions.innerHTML = '';
    
    symptoms.forEach(symptom => {
        const symptomOption = document.createElement('div');
        symptomOption.className = 'symptom-option';
        symptomOption.dataset.id = symptom.id;
        
        const severityClass = `severity severity-${symptom.severity}`;
        
        symptomOption.innerHTML = `
            <span>${symptom.name}</span>
            <span class="${severityClass}">${symptom.severity}</span>
        `;
        
        symptomOption.addEventListener('click', () => toggleSymptom(symptom.id, symptom.name));
        symptomOptions.appendChild(symptomOption);
    });
}

// Toggle symptom selection
function toggleSymptom(symptomId, symptomName) {
    const symptomElement = document.querySelector(`.symptom-option[data-id="${symptomId}"]`);
    
    if (selectedSymptoms.includes(symptomId)) {
        // Remove symptom
        selectedSymptoms = selectedSymptoms.filter(id => id !== symptomId);
        symptomElement.classList.remove('selected');
    } else {
        // Add symptom
        selectedSymptoms.push(symptomId);
        symptomElement.classList.add('selected');
    }
    
    updateSelectedSymptomsDisplay();
}

// Update the display of selected symptoms
function updateSelectedSymptomsDisplay() {
    selectedCount.textContent = selectedSymptoms.length;
    
    if (selectedSymptoms.length === 0) {
        selectedList.innerHTML = '<p style="color: var(--gray); font-style: italic;">No symptoms selected</p>';
        return;
    }
    
    selectedList.innerHTML = '';
    selectedSymptoms.forEach(symptomId => {
        const symptom = symptoms.find(s => s.id === symptomId);
        if (symptom) {
            const tag = document.createElement('div');
            tag.className = 'selected-symptom-tag';
            tag.innerHTML = `
                ${symptom.name}
                <i class="fas fa-times" data-id="${symptomId}"></i>
            `;
            
            tag.querySelector('i').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSymptom(symptomId, symptom.name);
            });
            
            selectedList.appendChild(tag);
        }
    });
}

// Clear selected symptoms
function clearSelectedSymptoms() {
    selectedSymptoms = [];
    document.querySelectorAll('.symptom-option.selected').forEach(el => {
        el.classList.remove('selected');
    });
    updateSelectedSymptomsDisplay();
}

// Analyze selected symptoms
function analyzeSymptoms() {
    if (selectedSymptoms.length === 0) {
        alert('Please select at least one symptom to analyze.');
        return;
    }
    
    // Find allergens associated with selected symptoms
    const possibleAllergens = new Set();
    const symptomDetails = [];
    
    selectedSymptoms.forEach(symptomId => {
        const symptom = symptoms.find(s => s.id === symptomId);
        if (symptom) {
            symptomDetails.push(symptom.name);
            symptom.allergens.forEach(allergenId => {
                possibleAllergens.add(allergenId);
            });
        }
    });
    
    // Calculate risk level based on symptom severity
    let riskLevel = "low";
    const selectedSymptomObjects = symptoms.filter(s => selectedSymptoms.includes(s.id));
    
    if (selectedSymptomObjects.some(s => s.severity === "high")) {
        riskLevel = "high";
    } else if (selectedSymptomObjects.some(s => s.severity === "medium")) {
        riskLevel = "medium";
    }
    
    // Get allergen names
    const allergenNames = Array.from(possibleAllergens).map(id => {
        const allergen = allergens.find(a => a.id === id);
        return allergen ? allergen.name : '';
    }).filter(name => name !== '');
    
    // Generate recommendations based on risk level
    let recommendations = [];
    let emergencyAdvice = '';
    
    if (riskLevel === "high") {
        recommendations = [
            "Seek immediate medical attention",
            "Use epinephrine auto-injector if prescribed",
            "Call emergency services if breathing is difficult",
            "Avoid all potential allergens until seen by a doctor",
            "Have someone stay with you until help arrives"
        ];
        emergencyAdvice = '<div class="allergy-level level-high"><i class="fas fa-exclamation-triangle"></i> <strong>HIGH RISK: Immediate medical attention required</strong></div>';
    } else if (riskLevel === "medium") {
        recommendations = [
            "Take antihistamines if prescribed by your doctor",
            "Monitor symptoms closely for worsening",
            "Contact your healthcare provider for advice",
            "Avoid suspected foods and keep a food diary",
            "Have emergency medication accessible"
        ];
        emergencyAdvice = '<div class="allergy-level level-medium"><i class="fas fa-exclamation-circle"></i> <strong>MEDIUM RISK: Contact healthcare provider</strong></div>';
    } else {
        recommendations = [
            "Take note of what you ate recently",
            "Monitor symptoms for any changes",
            "Consider keeping a food diary",
            "Schedule an appointment with an allergist for testing",
            "Avoid suspected foods until you can be tested"
        ];
        emergencyAdvice = '<div class="allergy-level level-low"><i class="fas fa-info-circle"></i> <strong>LOW RISK: Monitor and track symptoms</strong></div>';
    }
    
    // Display results
    analysisResult.innerHTML = `
        <div class="analysis-result">
            ${emergencyAdvice}
            <p><strong>Selected Symptoms:</strong> ${symptomDetails.join(', ')}</p>
            <p><strong>Possible Allergens:</strong> ${allergenNames.length > 0 ? allergenNames.join(', ') : 'No specific allergens identified'}</p>
            <div class="recommendations">
                <h4><i class="fas fa-lightbulb"></i> Recommendations:</h4>
                <ul>
                    ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            <button class="btn btn-primary" id="logResultBtn" style="margin-top: 15px;">
                <i class="fas fa-clipboard-check"></i> Log This Reaction
            </button>
        </div>
    `;
    
    // Add event listener to log result button
    document.getElementById('logResultBtn').addEventListener('click', () => {
        const newLog = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            allergen: allergenNames.length > 0 ? allergenNames[0] : "Unknown",
            symptoms: symptomDetails,
            severity: riskLevel === "high" ? "severe" : riskLevel === "medium" ? "moderate" : "mild",
            notes: "Logged from symptom analysis"
        };
        
        // Save to Firestore
        saveLogToFirestore(newLog);
        
        // Add to log entries
        logEntries.unshift(newLog);
        renderLogEntries();
        updateLogStats();
        
        // Switch to log section
        showSection('allergy-log');
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector(`[data-section="allergy-log"]`).classList.add('active');
        
        alert('Reaction logged successfully!');
    });
}

// Show allergen detail in modal
function showAllergenDetail(allergenId) {
    const allergen = allergens.find(a => a.id === allergenId);
    if (!allergen) return;
    
    document.getElementById('modalAllergenName').textContent = allergen.name;
    
    // Populate symptoms
    const modalSymptoms = document.getElementById('modalSymptoms');
    modalSymptoms.innerHTML = allergen.symptoms.map(symptom => `<li>${symptom}</li>`).join('');
    
    // Populate foods to avoid
    const modalFoods = document.getElementById('modalFoods');
    modalFoods.innerHTML = allergen.foods.map(food => `<li>${food}</li>`).join('');
    
    // Populate management tips
    const modalTips = document.getElementById('modalTips');
    modalTips.innerHTML = allergen.tips.map(tip => `<li>${tip}</li>`).join('');
    
    // Set cross-reactivity
    document.getElementById('modalCrossReactivity').textContent = allergen.crossReactivity;
    
    // Show modal
    allergenDetailModal.classList.add('show');
}

// Filter allergens based on search
function filterAllergens() {
    const searchTerm = allergenSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderAllergens();
        return;
    }
    
    const filtered = allergens.filter(allergen => {
        // Search in name
        if (allergen.name.toLowerCase().includes(searchTerm)) return true;
        
        // Search in symptoms
        if (allergen.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm))) return true;
        
        // Search in foods to avoid
        if (allergen.foods.some(food => food.toLowerCase().includes(searchTerm))) return true;
        
        return false;
    });
    
    renderAllergens(filtered);
}

// Populate allergen select in log form
function populateAllergenSelect() {
    const select = document.getElementById('logAllergen');
    select.innerHTML = '<option value="">Select an allergen</option>';
    
    allergens.forEach(allergen => {
        const option = document.createElement('option');
        option.value = allergen.name;
        option.textContent = allergen.name;
        select.appendChild(option);
    });
    
    // Add "Other" option
    const otherOption = document.createElement('option');
    otherOption.value = "Other";
    otherOption.textContent = "Other (specify in notes)";
    select.appendChild(otherOption);
}

// Populate symptom checkboxes in log form
function populateLogSymptoms() {
    const container = document.getElementById('logSymptoms');
    container.innerHTML = '';
    
    symptoms.forEach(symptom => {
        const checkboxOption = document.createElement('label');
        checkboxOption.className = 'checkbox-option';
        
        checkboxOption.innerHTML = `
            <input type="checkbox" value="${symptom.name}">
            <span>${symptom.name}</span>
        `;
        
        container.appendChild(checkboxOption);
    });
}

// Render log entries
function renderLogEntries() {
    logEntriesContainer.innerHTML = '';
    
    if (logEntries.length === 0) {
        logEntriesContainer.innerHTML = '<p class="no-entries">No log entries yet. Add your first entry to track your allergies.</p>';
        return;
    }
    
    logEntries.forEach(entry => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${entry.severity}`;
        
        const reactionClass = `log-reaction reaction-${entry.severity}`;
        
        logEntry.innerHTML = `
            <div class="log-date">
                <i class="far fa-calendar"></i> ${formatDate(entry.date)}
            </div>
            <h4>Reaction to: ${entry.allergen}</h4>
            <p><strong>Symptoms:</strong> ${entry.symptoms.join(', ')}</p>
            ${entry.notes ? `<p><strong>Notes:</strong> ${entry.notes}</p>` : ''}
            ${entry.firestoreId ? `<p class="firestore-id"><i class="fas fa-database"></i> Firestore ID: ${entry.firestoreId}</p>` : ''}
            <div class="${reactionClass}">${entry.severity} reaction</div>
        `;
        
        logEntriesContainer.appendChild(logEntry);
    });
}

// Update log statistics
function updateLogStats() {
    document.getElementById('totalEntries').textContent = logEntries.length;
    
    if (logEntries.length === 0) {
        document.getElementById('mostCommonAllergen').textContent = '-';
        document.getElementById('lastReaction').textContent = '-';
        return;
    }
    
    // Find most common allergen
    const allergenCounts = {};
    logEntries.forEach(entry => {
        allergenCounts[entry.allergen] = (allergenCounts[entry.allergen] || 0) + 1;
    });
    
    let mostCommon = '';
    let maxCount = 0;
    
    for (const [allergen, count] of Object.entries(allergenCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostCommon = allergen;
        }
    }
    
    document.getElementById('mostCommonAllergen').textContent = mostCommon;
    
    // Get last reaction date
    const lastEntry = logEntries[0];
    document.getElementById('lastReaction').textContent = formatDate(lastEntry.date);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// ============================================
// INITIALIZE THE APP
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

// Export for debugging
window.firebaseDebug = {
    testConnection: testFirestoreConnection,
    db: () => db,
    config: firebaseConfig
};