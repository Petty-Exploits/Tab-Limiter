document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");
    const darkModeToggle = document.getElementById("darkModeToggle"); // Add this line

    // Load the current tab limit from storage and display it
    chrome.storage.sync.get(["tabLimit"], function (result) {
        tabLimitInput.value = result.tabLimit || 10;
    });

    // Handle the "Save" button click
    setLimitButton.addEventListener("click", function () {
        const newTabLimit = parseInt(tabLimitInput.value);

        if (!isNaN(newTabLimit)) {
            if (newTabLimit <= 10) { // Check if the new limit is not greater than 10
                // Save the new tab limit to storage
                chrome.storage.sync.set({ tabLimit: newTabLimit }, function () {
                    // Notify the background script to apply the new limit
                    chrome.runtime.sendMessage({ setTabLimit: newTabLimit });

                    // Display a message indicating that the changes were saved
                    const status = document.getElementById("status");
                    status.textContent = "Changes saved.";
                    setTimeout(function () {
                        status.textContent = "";
                    }, 1500);
                });
            } else {
                // Display a "Nice try" message when the limit is exceeded
                const status = document.getElementById("status");
                status.textContent = "Nice try! The maximum limit is 10.";
                setTimeout(function () {
                    status.textContent = "";
                }, 4500);
            }
        }
    });

    // Handle the "Dark Mode" button click - Add this section
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });
});
