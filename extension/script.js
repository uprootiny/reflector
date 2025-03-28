// script.js (Corrected and Complete Implementation)

const hudContainer = document.getElementById('hud-container');
const hudInput = document.getElementById('hud-input');
const suggestionsList = document.getElementById('suggestions');
const statusDiv = document.getElementById('status-div');

let suggestions = [];
let db;
let scrapingStatus = {
    total: 0,
    processed: 0,
    errors: [],
    schemas: {
        chatgpt: { working: false, lastChecked: null },
        claude: { working: false, lastChecked: null },
        perplexity: { working: false, lastChecked: null },
        find: { working: false, lastChecked: null },
        mistral: { working: false, lastChecked: null },
        grok: { working: false, lastChecked: null },
        lmarena: { working: false, lastChecked: null },
    },
};

// IndexedDB initialization
const request = indexedDB.open('conversationDB', 1);

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.errorCode);
    reportStatus(`IndexedDB error: ${event.target.errorCode}`, 'error');
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
    reportStatus('System initialized.', 'success');
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

function scrapeChatGPT() { executeScrape('scrapeChatGPT', 'ChatGPT'); }
function scrapeClaude() { executeScrape('scrapeClaude', 'Claude'); }
function scrapePerplexity() { executeScrape('scrapePerplexity', 'Perplexity'); }
function scrapeFind() { executeScrape('scrapeFind', 'Find'); }
function scrapeMistral() { executeScrape('scrapeMistral', 'Mistral'); }
function scrapeGrok() { executeScrape('scrapeGrok', 'Grok'); }
function scrapeLMArena() { executeScrape('scrapeLMArena', 'LMArena'); }

function executeScrape(action, siteName) {
    chrome.runtime.sendMessage({ action: action }, (response) => {
        if (response.error) {
            reportStatus(`Scraping ${siteName} error: ${response.error}`, 'error');
        } else {
            storeConversations(response.results.conversations);
            reportStatus(`Scraping ${siteName}: <span class="math-inline">\{response\.results\.scrapingStatus\.processed\}/</span>{response.results.scrapingStatus.total}`, 'info');
            if (response.results.scrapingStatus.errors.length) {
                reportStatus(`Errors: ${response.results.scrapingStatus.errors.join(', ')}`, 'error');
            }
            reportStatus(`${siteName} scraping completed.`, 'success');
        }
    });
}

function checkSchemas() {
    chrome.runtime.sendMessage({ action: 'checkSchemas' }, (response) => {
        if (response.error) {
            reportStatus(`Schema check error: ${response.error}`, 'error');
        } else {
            scrapingStatus.schemas.chatgpt.working = response.results.chatgpt;
            scrapingStatus.schemas.claude.working = response.results.claude;
            scrapingStatus.schemas.perplexity.working = response.results.perplexity;
            scrapingStatus.schemas.find.working = response.results.find;
            scrapingStatus.schemas.mistral.working = response.results.mistral;
            scrapingStatus.schemas.grok.working = response.results.grok;
            scrapingStatus.schemas.lmarena.working = response.results.lmarena;

            scrapingStatus.schemas.chatgpt.lastChecked = new Date();
            scrapingStatus.schemas.claude.lastChecked = new Date();
            scrapingStatus.schemas.perplexity.lastChecked = new Date();
            scrapingStatus.schemas.find.lastChecked = new Date();
            scrapingStatus.schemas.mistral.lastChecked = new Date();
            scrapingStatus.schemas.grok.lastChecked = new Date();
            scrapingStatus.schemas.lmarena.lastChecked = new Date();

            reportStatus(`ChatGPT schema: ${scrapingStatus.schemas.chatgpt.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.chatgpt.working ? 'success' : 'warning');
            reportStatus(`Claude schema: ${scrapingStatus.schemas.claude.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.claude.working ? 'success' : 'warning');
            reportStatus(`Perplexity schema: ${scrapingStatus.schemas.perplexity.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.perplexity.working ? 'success' : 'warning');
            reportStatus(`Find schema: ${scrapingStatus.schemas.find.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.find.working ? 'success' : 'warning');
            reportStatus(`Mistral schema: ${scrapingStatus.schemas.mistral.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.mistral.working ? 'success' : 'warning');
            reportStatus(`Grok schema: ${scrapingStatus.schemas.grok.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.grok.working ? 'success' : 'warning');
            reportStatus(`LMArena schema: ${scrapingStatus.schemas.lmarena.working ? 'Working' : 'Stale'}`, scrapingStatus.schemas.lmarena.working ? 'success' : 'warning');
        }
    });
}
function grabPageContent() {
    chrome.runtime.sendMessage({ action: 'grabPageContent' }, (





 chrome.runtime.sendMessage({ action: 'grabPageContent' }, (response) => {
        if (response.error) {
            reportStatus(`Grab page error: ${response.error}`, 'error');
        } else {
            console.log(response.results);
            reportStatus('Page content logged to console.', 'info');
        }
    });
}

function storeConversations(conversations) {
    const transaction = db.transaction(['conversations'], 'readwrite');
    const objectStore = transaction.objectStore('conversations');

    conversations.forEach(conversation => {
        objectStore.add(conversation);
    });

    transaction.oncomplete = () => {
        loadSuggestions();
        reportStatus('Conversations stored in IndexedDB.', 'success');
    };

    transaction.onerror = (event) => {
        console.error('Error storing conversations:', event.target.errorCode);
        reportStatus(`Error storing conversations: ${event.target.errorCode}`, 'error');
    };
}

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

function reportStatus(message, type) {
    console.log(message);
    statusDiv.textContent = message;
    statusDiv.className = type || 'info'; // Default to 'info'

    // Visual cues based on type
    switch (type) {
        case 'error':
            statusDiv.style.color = 'red';
            break;
        case 'success':
            statusDiv.style.color = 'green';
            break;
        case 'warning':
            statusDiv.style.color = 'orange';
            break;
        default:
            statusDiv.style.color = 'white';
    }
}

// Add event listeners to buttons
document.getElementById('scrape-chatgpt').addEventListener('click', scrapeChatGPT);
document.getElementById('scrape-claude').addEventListener('click', scrapeClaude);
document.getElementById('scrape-perplexity').addEventListener('click', scrapePerplexity);
document.getElementById('scrape-find').addEventListener('click', scrapeFind);
document.getElementById('scrape-mistral').addEventListener('click', scrapeMistral);
document.getElementById('scrape-grok').addEventListener('click', scrapeGrok);
document.getElementById('scrape-lmarena').addEventListener('click', scrapeLMArena);
document.getElementById('check-schemas').addEventListener('click', checkSchemas);
document.getElementById('grab-page').addEventListener('click', grabPageContent);
