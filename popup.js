document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const saveMessage = document.getElementById("saveMessage");

    // Load the current tab limit from storage and display it
    chrome.storage.sync.get(["tabLimit"], function (result) {
        const currentTabLimit = result.tabLimit || 10;
        tabLimitInput.value = currentTabLimit;
    });

    // Handle input events in the tabLimitInput
    tabLimitInput.addEventListener("input", function () {
        // Get the input value
        const inputText = tabLimitInput.value.trim();

        setLimitButton.disabled = false; // Enable the "Set Limit" button by default

        if (inputText.toLowerCase() !== "konami" && inputText.toLowerCase() !== "suredoes") {
            // If it's not a cheat code, check if it's a valid number
            const newTabLimit = parseInt(inputText);
            setLimitButton.disabled = isNaN(newTabLimit) || newTabLimit > 15;
        }
    });

    // Handle the "Set Limit" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = tabLimitInput.value.trim().toLowerCase();

        if (newTabLimit === "konami") {
            // If the Konami code is entered, set the tab limit to 20
            setTabLimit(20, "Cheat code activated. Tab limit set to 20.");
        } else if (newTabLimit === "suredoes") {
            // If the Cheat Code is entered, set the tab limit to 30
            setTabLimit(30, "Cheat code activated. Tab limit set to 30.");
        } else {
            // Check if the entered value is a valid number and within the maximum limit
            const numericTabLimit = parseInt(newTabLimit);

            if (!isNaN(numericTabLimit) && numericTabLimit <= 15) {
                setTabLimit(numericTabLimit, "Changes saved.");
            } else {
                // Display a message indicating that the limit can't exceed 15
                saveMessage.textContent = "Maximum limit is 15 tabs.";
                saveMessage.style.color = "red"; // Set text color to red
                saveMessage.style.display = "block";
            }
        }
    });

    // Add dark mode functionality (this part remains the same)
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

    function setTabLimit(newLimit, message) {
        // Save the new tab limit to storage
        chrome.storage.sync.set({ tabLimit: newLimit }, function () {
            // Notify the background script to apply the new limit
            chrome.runtime.sendMessage({ setTabLimit: newLimit });

            // Display the message
            saveMessage.textContent = message;
            saveMessage.style.color = "green"; // Set text color to green
            saveMessage.style.display = "block";

            // Close the popup after a delay
            setTimeout(function () {
                window.close();
            }, 5000);
        });
    }
});
