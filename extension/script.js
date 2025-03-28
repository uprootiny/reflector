const hudContainer = document.getElementById('hud-container');
const hudInput = document.getElementById('hud-input');
const suggestionsList = document.getElementById('suggestions');

let suggestions = ['Claude conversations', 'ChatGPT conversations', 'Perplexity searches', 'Find results', 'Mistral chats', 'Grok outputs', 'LMArena discussions']; // Example suggestions

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
        suggestion.toLowerCase().includes(query.toLowerCase())
    );

    filteredSuggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
            hudInput.value = suggestion; // Select the suggestion
            hideHUD();
        });
        suggestionsList.appendChild(li);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === ' ') { // Ctrl+Shift+Space
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
