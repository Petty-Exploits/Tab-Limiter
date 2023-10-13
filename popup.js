document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const saveMessage = document.getElementById("saveMessage"); // Get the "Changes saved" message element

    // Load the current tab limit from storage and display it
    chrome.storage.sync.get(["tabLimit"], function (result) {
        tabLimitInput.value = result.tabLimit || 10;
    });

    // Handle the "Set Limit" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = parseInt(tabLimitInput.value);

        if (!isNaN(newTabLimit)) {
            if (newTabLimit <= 15) {
                // Save the new tab limit to storage
                chrome.storage.sync.set({ tabLimit: newTabLimit }, function () {
                    // Notify the background script to apply the new limit

                    // Display the "Changes saved" message
                    saveMessage.style.display = "block";
                    saveMessage.textContent = "Changes saved.";

                    // Close the popup after a delay
                    setTimeout(function () {
                        window.close();
                    }, 5500);
                });
            } else {
                // Display a message indicating that the limit can't exceed 15 and set the text color to red
                const status = document.getElementById("status");
                status.textContent = "Maximum limit is 15 tabs.";
                status.style.color = "red"; // Set text color to red
                setTimeout(function () {
                    status.textContent = "";
                    status.style.color = ""; // Reset text color
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
