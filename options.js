document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const windowLimitInput = document.getElementById("windowLimit");
    const saveLimitsButton = document.getElementById("saveLimits");

    // Load the current limits from storage and display them
    chrome.storage.sync.get(["tabLimit", "windowLimit"], function (result) {
        tabLimitInput.value = result.tabLimit || 10;
        windowLimitInput.value = result.windowLimit || 3;
    });

    // Handle the "Save" button click
    saveLimitsButton.addEventListener("click", function () {
        let newTabLimit = parseInt(tabLimitInput.value);
        let newWindowLimit = parseInt(windowLimitInput.value);

        if (!isNaN(newTabLimit) && !isNaN(newWindowLimit)) {
            // Enforce the maximum tab limit
            if (newTabLimit > 10) {
                newTabLimit = 10;
                tabLimitInput.value = 10; // Update the input field to show the enforced limit
            }

            // Enforce the maximum window limit
            if (newWindowLimit > 3) {
                newWindowLimit = 3;
                windowLimitInput.value = 3; // Update the input field to show the enforced limit
            }

            // Save the new tab and window limits to storage
            chrome.storage.sync.set({ tabLimit: newTabLimit, windowLimit: newWindowLimit }, function () {
                // Notify the background script to apply the new limits
                chrome.runtime.sendMessage({ setLimits: { tabLimit: newTabLimit, windowLimit: newWindowLimit } });

                // Display a message indicating that the changes were saved
                displayStatus("Changes saved.");
            });
        } else {
            // Handle input validation or display an error message
        }
    });

    // Helper function to display status messages
    function displayStatus(message) {
        const status = document.getElementById("status");
        status.textContent = message;
        setTimeout(function () {
            status.textContent = "";
        }, 4500);
    }
});
