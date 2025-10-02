let tabLimit = 10; // Default tab limit
const maxTabLimit = 15; // Maximum tab limit
let recentTabCreations = []; // Array to track recent tab creation timestamps
const spamThresholdCount = 9; // Number of tabs to consider spam
const spamThresholdTime = 3000; // Time window in milliseconds (3 seconds)

// Track notification timestamps and global count
const lastNotificationTimes = new Map(); // e.g., { 'spamAlert': 1234567890 }
const notificationCooldownMs = 30000; // 30 seconds cooldown per type
let notificationCount = 0; // Global notification counter
let lastMinuteReset = Date.now(); // Timestamp for resetting count
const maxNotificationsPerMinute = 3; // Max notifications per minute

// Load the initial tab limit from storage
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get(["tabLimit"], function (result) {
        tabLimit = result.tabLimit || 10;
        updateBadge();
    });
});

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get(["tabLimit"], function (result) {
        tabLimit = result.tabLimit || 10;
        updateBadge();
    });
});

// Listen for messages from the popup or options page to set the tab limit
chrome.runtime.onMessage.addListener(function (request) {
    if (request.setTabLimit) {
        tabLimit = request.setTabLimit;
        enforceTabLimit();
        updateBadge();
    }
});

// Check if content script is loaded on a tab
async function pingContentScript(tabId) {
    try {
        await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response?.status === "pong");
                }
            });
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Check if notification can be sent (cooldown + global cap)
function canSendNotification(type) {
    const now = Date.now();
    // Reset global count every minute
    if (now - lastMinuteReset >= 60000) {
        notificationCount = 0;
        lastMinuteReset = now;
    }
    // Check global cap
    if (notificationCount >= maxNotificationsPerMinute) {
        return false;
    }
    // Check per-type cooldown
    const lastTime = lastNotificationTimes.get(type) || 0;
    if (now - lastTime < notificationCooldownMs) {
        return false;
    }
    lastNotificationTimes.set(type, now);
    notificationCount++;
    return true;
}

// Retry sending a message to the active tab or next valid tab
async function sendMessageToActiveTab(message, maxRetries = 2, retryDelay = 1000) {
    let attempt = 1;
    while (attempt <= maxRetries) {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            // Early check for restricted URLs
            if (tabs[0] && tabs[0].url && (tabs[0].url.startsWith("chrome://") || tabs[0].url.startsWith("about://") || tabs[0].url.startsWith("file://"))) {
                break; // Skip retries for restricted URLs
            }
            if (tabs[0]) {
                const tabId = tabs[0].id;
                const isContentScriptReady = await pingContentScript(tabId);
                if (isContentScriptReady) {
                    await new Promise((resolve, reject) => {
                        chrome.tabs.sendMessage(tabId, message, (response) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                            } else {
                                resolve(response);
                            }
                        });
                    });
                    return true; // Success
                }
            }

            // Try next valid tab in the window
            const allTabs = await chrome.tabs.query({ currentWindow: true });
            for (const tab of allTabs) {
                if (tab.id !== tabs[0]?.id && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("about://") && !tab.url.startsWith("file://")) {
                    const isContentScriptReady = await pingContentScript(tab.id);
                    if (isContentScriptReady) {
                        await new Promise((resolve, reject) => {
                            chrome.tabs.sendMessage(tab.id, message, (response) => {
                                if (chrome.runtime.lastError) {
                                    reject(chrome.runtime.lastError);
                                } else {
                                    resolve(response);
                                }
                            });
                        });
                        return true; // Success
                    }
                }
            }
        } catch (error) {
            // Silently handle errors
        }
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        attempt++;
    }

    // Fallback to browser notification with cooldown and unique ID
    const notificationType = message.action === "showSpamAlert" ? "spamAlert" : "tabLimitAlert";
    if (canSendNotification(notificationType)) {
        const notificationId = `tabLimiter_${notificationType}_${Date.now()}`; // Unique ID
        chrome.notifications.create(notificationId, {
            title: notificationType === "spamAlert" ? "Tab Spam Detected" : "Tab Limit Reached",
            message: notificationType === "spamAlert" ? "Tab spam detected! Window closed to prevent abuse." : "Tab limit reached! Close tabs to continue.",
            iconUrl: "icon-128.png",
            type: "basic"
        });
    }
    return false;
}

// Listen for tab creation events
chrome.tabs.onCreated.addListener(async function (tab) {
    const now = Date.now();
    recentTabCreations.push(now);
    recentTabCreations = recentTabCreations.slice(-spamThresholdCount); // Keep only the last N creations

    // Check for spam: if the last 9 tabs were created within the time threshold
    if (recentTabCreations.length >= spamThresholdCount &&
        recentTabCreations[recentTabCreations.length - 1] - recentTabCreations[0] < spamThresholdTime) {
        // Close the current window
        try {
            const currentWindow = await chrome.windows.getCurrent();
            await chrome.windows.remove(currentWindow.id);
            if (canSendNotification("spamDetection")) {
                const notificationId = `spamDetected_${Date.now()}`;
                chrome.notifications.create(notificationId, {
                    title: "Tab Spam Detected",
                    message: "Too many tabs opened! Window closed to prevent abuse.",
                    iconUrl: "icon-128.png",
                    type: "basic"
                });
            }
            // Send spam alert to any remaining tabs (if new window opens)
            sendMessageToActiveTab({ action: "showSpamAlert" });
        } catch (error) {
            // Fallback to closing the new tab if window closure fails
            await chrome.tabs.remove(tab.id);
            sendMessageToActiveTab({ action: "showSpamAlert" });
        }
    } else {
        // Enforce limit immediately
        await enforceTabLimit();
    }
    updateBadge();
});

// Listen for tab removal events
chrome.tabs.onRemoved.addListener(function () {
    enforceTabLimit();
    updateBadge();
});

// Enforce the tab limit by closing excess tabs
async function enforceTabLimit() {
    const tabs = await chrome.tabs.query({});
    if (tabs.length > tabLimit) {
        const tabsToClose = tabs.slice(tabLimit);
        for (const tab of tabsToClose) {
            try {
                await chrome.tabs.remove(tab.id);
            } catch (error) {
                // Silently handle errors
            }
        }
        sendMessageToActiveTab({ action: "showTabLimitAlert" });
    }
}

// Update the extension badge with remaining tabs
function updateBadge() {
    chrome.tabs.query({}, function (tabs) {
        const currentTabs = tabs.length;
        const remaining = Math.max(tabLimit - currentTabs, 0);
        const badgeText = remaining > 0 ? remaining.toString() : '0';
        const badgeColor = remaining > 0 ? [0, 255, 0, 255] : [255, 0, 0, 255]; // Green or Red
        chrome.action.setBadgeText({ text: badgeText });
        chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    });
}