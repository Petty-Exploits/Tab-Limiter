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

    // Hide the message initially
    saveMessage.style.display = "none";

    // Handle the "Set Limit" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = tabLimitInput.value.trim().toLowerCase();

        if (newTabLimit === "^^vv<><>bastart") {
            // If the Konami code is entered, set the tab limit to 20
            setTabLimit(20, "Cheat code activated. Tab limit set to 20.");
            // Display the message and add the class to enable animation
            saveMessage.textContent = "Cheat code activated. Tab limit set to 20.";
            saveMessage.style.display = "block";
            saveMessage.classList.add("cheat-code-message");
        } else if (newTabLimit === "CHEATCODE") {
            // If the Cheat Code is entered, set the tab limit to 30
            setTabLimit(30, "Cheat code activated. Tab limit set to 30.");
            // Display the message and add the class to enable animation
            saveMessage.textContent = "Cheat code activated. Tab limit set to 30.";
            saveMessage.style.display = "block";
            saveMessage.classList.add("cheat-code-message");
        } else {
            // Check if the entered value is a valid number and within the maximum limit
            const numericTabLimit = parseInt(newTabLimit);

            if (!isNaN(numericTabLimit) && numericTabLimit <= 15) {
                setTabLimit(numericTabLimit, "Changes saved.");
                // Display the message and remove the animation class
                saveMessage.textContent = "Changes saved.";
                saveMessage.style.display = "block";
                saveMessage.classList.remove("cheat-code-message");
            } else {
                // Display a message indicating that the limit can't exceed 15
                saveMessage.textContent = "Maximum limit is 15 tabs.";
                saveMessage.style.color = "red";
                saveMessage.style.display = "block";
                // Remove the animation class
                saveMessage.classList.remove("cheat-code-message");
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

    function setTabLimit(newLimit, message) {
        // Save the new tab limit to storage
        chrome.storage.sync.set({ tabLimit: newLimit }, function () {
            // Notify the background script to apply the new limit
            chrome.runtime.sendMessage({ setTabLimit: newLimit });

            // Display the message
            saveMessage.textContent = message;
            saveMessage.style.color = "green";
            saveMessage.style.display = "block";

            // Close the popup after a delay
            setTimeout(function () {
                window.close();
            }, 10000);
        });
    }
});
