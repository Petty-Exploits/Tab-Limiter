document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const saveMessage = document.getElementById("saveMessage");

    // Load the current tab limit from storage and display it
    chrome.storage.sync.get(["tabLimit"], function (result) {
        tabLimitInput.value = result.tabLimit || 10;
    });

    // Handle the "Save" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = parseInt(tabLimitInput.value);

        if (!isNaN(newTabLimit)) {
            if (newTabLimit <= 15) {
                // Save the new tab limit to storage
                chrome.storage.sync.set({ tabLimit: newTabLimit }, function () {
                    // Display the "Changes saved" message
                    saveMessage.style.display = "block";
                    saveMessage.textContent = "Changes saved.";

                    // Close the options page after a short delay
                    setTimeout(function () {
                        window.close();
                    }, 2000);
                });
            } else {
                // Display a message indicating that the limit can't exceed 15
                const status = document.getElementById("status");
                if (status) {
                    status.textContent = "Maximum limit is 15 tabs.";
                    status.style.color = "red";
                    setTimeout(function () {
                        status.textContent = "";
                        status.style.color = "";
                    }, 4500);
                } else {
                    console.warn("Status element not found in options.html");
                }
            }
        }
    });

    // Add dark mode functionality with null check
    chrome.storage.sync.get("darkMode", function (result) {
        const isDarkMode = result.darkMode || false;
        toggleDarkMode(isDarkMode);
    });

    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function () {
            chrome.storage.sync.get("darkMode", function (result) {
                const isDarkMode = !result.darkMode;
                toggleDarkMode(isDarkMode);
                chrome.storage.sync.set({ darkMode: isDarkMode });
            });
        });
    } else {
        console.warn("Dark mode toggle button not found in options.html");
    }

    function toggleDarkMode(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }
});