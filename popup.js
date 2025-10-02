document.addEventListener("DOMContentLoaded", function () {
    const tabLimitInput = document.getElementById("tabLimit");
    const setLimitButton = document.getElementById("setLimitButton");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const saveMessage = document.getElementById("saveMessage");
    const tabCounter = document.getElementById("tabCounter");

    // Cheat Codes - Good luck nerds
    const cheatCodeHashes = {
        "67": "0d098b1c0162939e05719f059f0f844ed989472e9e6a53283a00fe92127ac27f",
        "getAjob": "2fe93ebff8af32d75b4de8283b8e2bfecc725336cfc37b09b06a629ea49c24a9" 
    };

    
    async function hashInput(input) {
        const msgBuffer = new TextEncoder().encode(input.toLowerCase());
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    chrome.storage.sync.get(["tabLimit"], function (result) {
        const currentTabLimit = result.tabLimit || 10;
        tabLimitInput.value = currentTabLimit;

    
        chrome.tabs.query({}, function (tabs) {
            const currentTabs = tabs.length;
            const remaining = Math.max(currentTabLimit - currentTabs, 0);
            tabCounter.textContent = `You can open ${remaining} more tabs.`;
        });
    });

    
    saveMessage.style.display = "none";

   
    setLimitButton.addEventListener("click", async function () {
        const newTabLimit = tabLimitInput.value.trim().toLowerCase();
        const hashedInput = await hashInput(newTabLimit);

        if (hashedInput === cheatCodeHashes["67"]) {
            setTabLimit(20, "Cheat code activated. Tab limit set to 20.");
            saveMessage.textContent = "Cheat code activated. Tab limit set to 20.";
            saveMessage.style.display = "block";
            saveMessage.classList.add("cheat-code-message");
        } else if (hashedInput === cheatCodeHashes["getAjob"]) {
            setTabLimit(30, "Cheat code activated. Tab limit set to 30.");
            saveMessage.textContent = "Cheat code activated. Tab limit set to 30.";
            saveMessage.style.display = "block";
            saveMessage.classList.add("cheat-code-message");
        } else {
            const numericTabLimit = parseInt(newTabLimit);

            if (!isNaN(numericTabLimit) && numericTabLimit <= 15) {
                setTabLimit(numericTabLimit, "Changes saved.");
                saveMessage.textContent = "Changes saved.";
                saveMessage.style.display = "block";
                saveMessage.classList.remove("cheat-code-message");
            } else {
                saveMessage.textContent = "Maximum limit is 15 tabs.";
                saveMessage.style.color = "red";
                saveMessage.style.display = "block";
                saveMessage.classList.remove("cheat-code-message");
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
    }

    function toggleDarkMode(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    function setTabLimit(newLimit, message) {
        chrome.storage.sync.set({ tabLimit: newLimit }, function () {
            chrome.runtime.sendMessage({ setTabLimit: newLimit });
            saveMessage.textContent = message;
            saveMessage.style.color = "green";
            saveMessage.style.display = "block";

            // Update the counter after setting new limit
            chrome.tabs.query({}, function (tabs) {
                const currentTabs = tabs.length;
                const remaining = Math.max(newLimit - currentTabs, 0);
                tabCounter.textContent = `You can open ${remaining} more tabs.`;
            });

            setTimeout(function () {
                window.close();
            }, 10000);
        });
    }
});