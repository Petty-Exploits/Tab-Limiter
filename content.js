chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    try {
        // Load last alert times from sessionStorage for persistence
        let lastAlertTimes = JSON.parse(sessionStorage.getItem('tabLimiterAlerts') || '{}');
        const alertCooldownMs = 10000; // 10 seconds per alert type
        const now = Date.now();

        if (request.action === "showTabLimitAlert") {
            const type = 'tabLimit';
            if (now - (lastAlertTimes[type] || 0) < alertCooldownMs) {
                sendResponse({ status: "skipped" });
                return;
            }
            lastAlertTimes[type] = now;
            sessionStorage.setItem('tabLimiterAlerts', JSON.stringify(lastAlertTimes));
            showModal('tabLimitDialog', "Tab limit reached! You cannot open more tabs until some are closed.", type);
            sendResponse({ status: "success" });
        } else if (request.action === "showSpamAlert") {
            const type = 'spam';
            if (now - (lastAlertTimes[type] || 0) < alertCooldownMs) {
                sendResponse({ status: "skipped" });
                return;
            }
            lastAlertTimes[type] = now;
            sessionStorage.setItem('tabLimiterAlerts', JSON.stringify(lastAlertTimes));
            showModal('spamDialog', "Tab spam detected! Your tab limit has been set to 1. Change it back in the extension popup.", type);
            sendResponse({ status: "success" });
        } else if (request.action === "ping") {
            sendResponse({ status: "pong" });
        } else {
            sendResponse({ status: "unknown action" });
        }
    } catch (error) {
        sendResponse({ status: "error", error: error.message });
    }
});

// Helper: Show modal with only Close button
function showModal(id, message, type) {
    let dialog = document.getElementById(id);
    if (!dialog) {
        dialog = document.createElement("div");
        dialog.id = id;
        dialog.className = "modal";
        dialog.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <button id="dialogCloseButton">Close</button>
            </div>
        `;
        document.body.appendChild(dialog);
    }
    dialog.classList.remove("hidden");

    // Event listener for Close button
    const closeButton = document.getElementById("dialogCloseButton");
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            dialog.classList.add("hidden");
        });
    }
}