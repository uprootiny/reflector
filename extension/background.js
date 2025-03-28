// background.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeChatGPT') {
        executeScraping(sender.tab.id, '.text-base', sendResponse);
        return true;
    } else if (request.action === 'scrapeClaude') {
        executeScraping(sender.tab.id, '.ProseMirror', sendResponse); // Example selector, needs verification
        return true;
    } else if (request.action === 'scrapePerplexity') {
        executeScraping(sender.tab.id, '.prose', sendResponse); // Example selector, needs verification
        return true;
    } else if (request.action === 'scrapeFind') {
        executeScraping(sender.tab.id, '.find-result', sendResponse); // Example selector, needs verification
        return true;
    } else if (request.action === 'scrapeMistral') {
        executeScraping(sender.tab.id, '.message-text', sendResponse); // Example selector, needs verification
        return true;
    } else if (request.action === 'scrapeGrok') {
        executeScraping(sender.tab.id, '.grok-message', sendResponse); // Example selector, needs verification
        return true;
    } else if (request.action === 'scrapeLMArena') {
        executeScraping(sender.tab.id, '.message', sendResponse); // Example selector, needs verification
        return true;
    } else if (request.action === 'checkSchemas') {
        executeSchemaChecks(sender.tab.id, sendResponse);
        return true;
    } else if (request.action === 'grabPageContent') {
        executeGrabContent(sender.tab.id, sendResponse);
        return true;
    }
});

function executeScraping(tabId, selector, sendResponse) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: scrapeAndStore,
        args: [selector],
    }, (results) => {
        if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
        } else {
            sendResponse({ results: results[0].result });
        }
    });
}

function scrapeAndStore(selector) {
    const conversationElements = document.querySelectorAll(selector);
    const conversations = [];
    const scrapingStatus = {
        total: conversationElements.length,
        processed: 0,
        errors: [],
    };

    conversationElements.forEach(element => {
        try {
            conversations.push({ text: element.textContent });
            scrapingStatus.processed++;
        } catch (error) {
            scrapingStatus.errors.push(error.message);
        }
    });

    return { conversations, scrapingStatus };
}

function executeSchemaChecks(tabId, sendResponse) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: checkSchemasInPage,
    }, (results) => {
        if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
        } else {
            sendResponse({ results: results[0].result });
        }
    });
}

function checkSchemasInPage() {
    return {
        chatgpt: document.querySelectorAll('.text-base').length > 0,
        claude: document.querySelectorAll('.ProseMirror').length > 0,
        perplexity: document.querySelectorAll('.prose').length > 0,
        find: document.querySelectorAll('.find-result').length > 0,
        mistral: document.querySelectorAll('.message-text').length > 0,
        grok: document.querySelectorAll('.grok-message').length > 0,
        lmarena: document.querySelectorAll('.message').length > 0,
    };
}

function executeGrabContent(tabId, sendResponse) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: grabContent,
    }, (results) => {
        if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
        } else {
            sendResponse({ results: results[0].result });
        }
    });
}

function grabContent() {
    return document.documentElement.outerHTML;
}
