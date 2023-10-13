let tabLimit = 10; // Default tab limit
let windowLimit = 3; // Default window limit

// Listen for messages from the popup or options page to set the tab and window limits
chrome.runtime.onMessage.addListener(function (request) {
    if (request.setLimits) {
        tabLimit = request.setLimits.tabLimit;
        windowLimit = request.setLimits.windowLimit;
    }
});

// Listen for tab creation events
chrome.tabs.onCreated.addListener(function () {
    enforceTabLimit(); // Call the function to enforce tab limits
});

// ...

// Function to enforce the tab limit by closing excess tabs
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

// The rest of your code for window limits and other functionality
