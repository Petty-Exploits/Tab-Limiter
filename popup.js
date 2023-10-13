document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");

    // Load the current tab limit from storage and display it
    chrome.storage.sync.get(["tabLimit"], function (result) {
        tabLimitInput.value = result.tabLimit || 10;
    });

    // Handle the "Set Limit" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = parseInt(tabLimitInput.value);

        if (!isNaN(newTabLimit)) {
            if (newTabLimit <= 10) { // Ensure the new limit is not greater than 10
                // Save the new tab limit to storage
                chrome.storage.sync.set({ tabLimit: newTabLimit }, function () {
                    // Notify the background script to apply the new limit
                    chrome.runtime.sendMessage({ setTabLimit: newTabLimit });

                    // Close the popup
                    window.close();
                });
            } else {
                // Display a message indicating that the limit can't exceed 10
                const status = document.getElementById("status");
                status.textContent = "Maximum limit is 10 tabs.";
                setTimeout(function () {
                    status.textContent = "";
                }, 4500);
            }
        }
    });
});
