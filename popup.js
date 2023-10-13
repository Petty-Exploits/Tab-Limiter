document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const windowLimitInput = document.getElementById("windowLimit");
    const setLimitButton = document.getElementById("setLimitButton");

    // Load the current tab and window limits from storage and display them
    chrome.storage.sync.get(["tabLimit", "windowLimit"], function (result) {
        tabLimitInput.value = result.tabLimit || 10;
        windowLimitInput.value = result.windowLimit || 3;
    });

    // Handle the "Set Limit" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = parseInt(tabLimitInput.value);
        const newWindowLimit = parseInt(windowLimitInput.value);

        if (!isNaN(newTabLimit) && !isNaN(newWindowLimit)) {
            if (newTabLimit <= 10 && newWindowLimit <= 3) {
                // Save the new tab and window limits to storage
                chrome.storage.sync.set({ tabLimit: newTabLimit, windowLimit: newWindowLimit }, function () {
                    // Notify the background script to apply the new limits
                    chrome.runtime.sendMessage({ setLimits: { tabLimit: newTabLimit, windowLimit: newWindowLimit } });

                    // Close the popup
                    window.close();
                });
            } else {
                // Display a "Nice try" message when the limits are exceeded
                const status = document.getElementById("status");
                if (newTabLimit > 10) {
                    status.textContent = "Nice try! The maximum tab limit is 10.";
                } else {
                    status.textContent = "Nice try! The maximum window limit is 3.";
                }
                setTimeout(function () {
                    status.textContent = "";
                }, 4500);
            }
        }
    });
});
