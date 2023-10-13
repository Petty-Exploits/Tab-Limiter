document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");
    const darkModeToggle = document.getElementById("darkModeToggle"); // Add this line

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

    // Add dark mode functionality
    chrome.storage.sync.get("darkMode", function (result) {
        const isDarkMode = result.darkMode;
        toggleDarkMode(isDarkMode);
    });

    darkModeToggle.addEventListener("click", function () {
        chrome.storage.sync.get("darkMode", function (result) {
            const isDarkMode = !result.darkMode;
            toggleDarkMode(isDarkMode);
            chrome.storage.sync.set({ darkMode: isDarkMode });
        });
    });

    function toggleDarkMode(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }
});
