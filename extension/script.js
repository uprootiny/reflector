// script.js (modified for scraping, storage, search)

const hudContainer = document.getElementById('hud-container');
const hudInput = document.getElementById('hud-input');
const suggestionsList = document.getElementById('suggestions');

let suggestions = []; // Will be populated from IndexedDB
let db; // IndexedDB database object

// IndexedDB initialization
const request = indexedDB.open('conversationDB', 1);

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.errorCode);
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('text', 'text', { unique: false }); // Index for searching
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadSuggestions(); // Load data from IndexedDB
};

function showHUD() {
    hudContainer.classList.remove('hud-hidden');
    hudInput.focus();
}

function hideHUD() {
    hudContainer.classList.add('hud-hidden');
}

function updateSuggestions(query) {
    suggestionsList.innerHTML = ''; // Clear previous suggestions
    const filteredSuggestions = suggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
    );

    filteredSuggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion.text;
        li.addEventListener('click', () => {
            hudInput.value = suggestion.text;
            hideHUD();
        });
        suggestionsList.appendChild(li);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === ' ') {
        if (hudContainer.classList.contains('hud-hidden')) {
            showHUD();
        } else {
            hideHUD();
        }
    } else if (event.key === 'Escape') {
        hideHUD();
    }
});

// Input event listener for filtering
hudInput.addEventListener('input', () => {
    updateSuggestions(hudInput.value);
});

// Scraping ChatGPT conversations
function scrapeChatGPT() {
    const conversationElements = document.querySelectorAll('.text-base'); // Adjust selector as needed
    const conversations = [];

    conversationElements.forEach(element => {
        conversations.push({ text: element.textContent }); // Basic text extraction
    });
    storeConversations(conversations);
}

// Store conversations in IndexedDB
function storeConversations(conversations) {
    const transaction = db.transaction(['conversations'], 'readwrite');
    const objectStore = transaction.objectStore('conversations');

    conversations.forEach(conversation => {
        objectStore.add(conversation);
    });

    transaction.oncomplete = () => {
        console.log('Conversations stored in IndexedDB');
        loadSuggestions(); // Reload suggestions after storing
    };

    transaction.onerror = (event) => {
        console.error('Error storing conversations:', event.target.errorCode);
    };
}

// Load suggestions from IndexedDB
function loadSuggestions() {
    suggestions = []; // Reset suggestions
    const objectStore = db.transaction(['conversations']).objectStore('conversations');
    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            suggestions.push(cursor.value);
            cursor.continue();
        } else {
            updateSuggestions(hudInput.value); // Update suggestions after loading
        }
    };
}

// Add a button to trigger scraping (for testing)
const scrapeButton = document.createElement('button');
scrapeButton.textContent = 'Scrape ChatGPT';
scrapeButton.addEventListener('click', scrapeChatGPT);
document.body.appendChild(scrapeButton);
