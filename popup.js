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

    // Get the version number from the manifest file
    fetch(chrome.runtime.getURL("manifest.json"))
        .then((response) => response.json())
        .then((data) => {
            const versionElement = document.getElementById("version");
            versionElement.textContent = "Version: " + data.version;
        });

    // Handle input events in the tabLimitInput
tabLimitInput.addEventListener("input", function () {
    // Get the input value
    const inputText = tabLimitInput.value.trim();

    setLimitButton.disabled = false; // Enable the "Set Limit" button by default

    if (inputText.toLowerCase() !== "konami") {
        // If it's not the cheat code, check if it's a valid number
        const newTabLimit = parseInt(inputText);
        setLimitButton.disabled = isNaN(newTabLimit) || newTabLimit > 15;
    }
});


    // Handle the "Set Limit" button click
setLimitButton.addEventListener("click", function () {
    const newTabLimit = tabLimitInput.value.trim();
                                    //Change Cheatcode here
    if (newTabLimit.toLowerCase() === "konami") {
        // If the cheat code is entered, set the tab limit to 20
        chrome.storage.sync.set({ tabLimit: 20 }, function () {
            // Notify the background script to apply the new limit
            chrome.runtime.sendMessage({ setTabLimit: 20 });

            // Display the "Changes saved" message
            saveMessage.textContent = "Cheat code activated. Tab limit set to 20.";
            saveMessage.style.color = "green"; // Set text color to green
            saveMessage.style.display = "block";

            // Close the popup after a delay
            setTimeout(function () {
                window.close();
            }, 5000);
        });
    } else {
        // Check if the entered value is a valid number
        const numericTabLimit = parseInt(newTabLimit);

        if (!isNaN(numericTabLimit) && numericTabLimit <= 15) {
            // Save the new tab limit to storage
            chrome.storage.sync.set({ tabLimit: numericTabLimit }, function () {
                // Notify the background script to apply the new limit
                chrome.runtime.sendMessage({ setTabLimit: numericTabLimit });

                // Display the "Changes saved" message
                saveMessage.textContent = "Changes saved.";
                saveMessage.style.color = "green"; // Set text color to green
                saveMessage.style.display = "block";

                // Close the popup after a delay
                setTimeout(function () {
                    window.close();
                }, 5000);
            });
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
});
