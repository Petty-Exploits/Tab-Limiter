let tabLimit = 10; // Default tab limit
const maxTabLimit = 15; // Maximum tab limit

// Listen for messages from the popup or options page to set the tab limit
chrome.runtime.onMessage.addListener(function (request) {
    if (request.setTabLimit) {
        tabLimit = request.setTabLimit;
    }
});

// Listen for tab creation events
chrome.tabs.onCreated.addListener(function () {
    enforceTabLimit();
});

// Listen for tab removal events
chrome.tabs.onRemoved.addListener(function () {
    enforceTabLimit();
});

// Enforce the tab limit by closing excess tabs
function enforceTabLimit() {
    chrome.tabs.query({}, function (tabs) {
        if (tabs.length > tabLimit) {
            const tabsToClose = tabs.slice(tabLimit);
            for (const tab of tabsToClose) {
                chrome.tabs.remove(tab.id);
            }
        }
    });
}
