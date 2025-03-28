// background.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrapeChatGPT') {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            function: scrapeAndStore,
        }, (results) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ results: results[0].result });
            }
        });
        return true; // Indicate asynchronous response
    } else if (request.action === 'checkSchemas') {
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            function: checkSchemasInPage,
        }, (results) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ results: results[0].result });
            }
        });
        return true; // Indicate asynchronous response
    } else if (request.action === 'grabPageContent') {
      chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          function: grabContent,
      }, (results) => {
          if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
          } else {
              sendResponse({ results: results[0].result });
          }
      });
      return true; // Indicate asynchronous response
    }
});

function scrapeAndStore() {
    const conversationElements = document.querySelectorAll('.text-base');
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

function checkSchemasInPage() {
    const chatgptWorking = document.querySelectorAll('.text-base').length > 0;
    return { chatgpt: chatgptWorking };
}

function grabContent(){
    return document.documentElement.outerHTML;
}
