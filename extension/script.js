// script.js (corrected to use background.js exclusively)

const hudContainer = document.getElementById('hud-container');
const hudInput = document.getElementById('hud-input');
const suggestionsList = document.getElementById('suggestions');

let suggestions = [];
let db;
let scrapingStatus = {
    total: 0,
    processed: 0,
    errors: [],
    schemas: {
        chatgpt: { working: false, lastChecked: null },
        // Add more schemas as needed
    },
};

// IndexedDB initialization
const request = indexedDB.open('conversationDB', 1);

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.errorCode);
    reportStatus(`IndexedDB error: ${event.target.errorCode}`);
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    const objectStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('text', 'text', { unique: false });
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadSuggestions();
    checkSchemas();
    reportStatus('System initialized.');
};

function showHUD() {
    hudContainer.classList.remove('hud-hidden');
    hudInput.focus();
}

function hideHUD() {
    hudContainer.classList.add('hud-hidden');
}

function updateSuggestions(query) {
    suggestionsList.innerHTML = '';
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

hudInput.addEventListener('input', () => {
    updateSuggestions(hudInput.value);
});

function scrapeChatGPT() {
    chrome.runtime.sendMessage({ action: 'scrapeChatGPT' }, (response) => {
        if (response.error) {
            reportStatus(`Scraping error: ${response.error}`);
        } else {
            storeConversations(response.results.conversations);
            reportStatus(`Scraping: ${response.results.scrapingStatus.processed}/${response.results.scrapingStatus.total}`);
            if (response.results.scrapingStatus.errors.length) {
                reportStatus(`Errors: ${response.results.scrapingStatus.errors.join(', ')}`);
            }
            reportStatus('ChatGPT scraping completed.');
        }
    });
}

function checkSchemas() {
    chrome.runtime.sendMessage({ action: 'checkSchemas' }, (response) => {
        if (response.error) {
            reportStatus(`Schema check error: ${response.error}`);
        } else {
            scrapingStatus.schemas.chatgpt.working = response.results.chatgpt;
            scrapingStatus.schemas.chatgpt.lastChecked = new Date();
            reportStatus(`ChatGPT schema: ${scrapingStatus.schemas.chatgpt.working ? 'Working' : 'Stale'}`);
        }
    });
}

function grabPageContent() {
    chrome.runtime.sendMessage({ action: 'grabPageContent' }, (response) => {
        if (response.error) {
            reportStatus(`Grab page error: ${response.error}`);
        } else {
            console.log(response.results);
            reportStatus('Page content logged to console.');
        }
    });
}

// Store conversations in IndexedDB
function storeConversations(conversations) {
    const transaction = db.transaction(['conversations'], 'readwrite');
    const objectStore = transaction.objectStore('conversations');

    conversations.forEach(conversation => {
        objectStore.add(conversation);
    });

    transaction.oncomplete = () => {
        loadSuggestions();
        reportStatus('Conversations stored in IndexedDB.');
    };

    transaction.onerror = (event) => {
        console.error('Error storing conversations:', event.target.errorCode);
        reportStatus(`Error storing conversations: ${event.target.errorCode}`);
    };
}

// Load suggestions from IndexedDB
function loadSuggestions() {
    suggestions = [];
    const objectStore = db.transaction(['conversations']).objectStore('conversations');
    objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            suggestions.push(cursor.value);
            cursor.continue();
        } else {
            updateSuggestions(hudInput.value);
        }
    };
}

// Add a button to trigger scraping (for testing)
const scrapeButton = document.createElement('button');
scrapeButton.textContent = 'Scrape ChatGPT';
scrapeButton.addEventListener('click', scrapeChatGPT);
document.body.appendChild(scrapeButton);
