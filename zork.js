document.addEventListener("DOMContentLoaded", function () {
    const terminal = document.getElementById("terminal");
    const inputElement = document.getElementById("inputElement");
    const inventory = [];

    let currentScene = "startHorror";
    const keyItem = {
        name: "Key",
        description: "An old rusty key."
    };
    // Add the key item to the available items
    const availableItems = [keyItem];

    function appendMessageWithTyping(message, callback) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("terminal-text");
        terminal.appendChild(messageElement);

        function typeText(text, index) {
            if (index < text.length) {
                messageElement.innerHTML += text[index];
                index++;
                setTimeout(function () {
                    typeText(text, index);
                }, 20);
            } else {
                if (callback) {
                    callback();
                }
            }
        }

        typeText(message, 0);
        terminal.scrollTop = terminal.scrollHeight;
    }

 function processUserInput(input) {
    const isNumeric = /^\d+$/.test(input);

    if (isNumeric) {
        // Convert numeric input to string
        input = input.toString();
        processSceneInput(input);
    } else {
        switch (input) {
            case "cls":
                clearTerminal();
                break;
            case "restart":
                clearTerminal();
                inventory.length = 0;
                startHorrorScenario();
                break;
            case "inventory":
            appendMessage("Your inventory:");
            if (inventory.length === 0) {
                appendMessage("Your inventory is empty.");
            } else {
                inventory.forEach((item, index) => {
                    appendMessage(`${index + 1} - ${item.name}`);
                });
            }
            break;
        case "help":
            clearTerminal();
            appendMessage("Available commands:");
            appendMessage("- cls: Clear the screen");
            appendMessage("- restart: Restart the game");
            appendMessage("- inventory: List your inventory");
            break;
      default:
                appendMessageWithTyping("Invalid command. Choose a valid option.");
                break;
        }
    }
}
    function addToInventory(item) {
    if (!inventory.some(i => i.name === item.name)) {
        inventory.push(item);
    }
}

    function appendMessage(message, isUserCommand = false) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("terminal-text");
        if (isUserCommand) {
            messageElement.classList.add("user-command"); // Add a class for user commands
        }
        messageElement.innerHTML = message;
        terminal.appendChild(messageElement);
        terminal.scrollTop = terminal.scrollHeight;
    }
        // Define a new function to handle the Media Center scenario
    function processMediaCenterScenario() {
        clearTerminal();
        currentScene = "mediaCenter";
        
        appendMessageWithTyping("You find yourself in a dimly lit media center. The air is heavy with an unsettling silence, and the flickering light above casts eerie shadows. Old books line the shelves, and a broken printer sits on a table. The smell of popcorn lingers in the air from a nearby machine. There's a note that says, 'Fix the printer for a surprise!'", function () {
            displayScenarioOptions(["Fix the printer", "Search the books", "Check the popcorn machine", "Go back to the beginning"]);
        });
    }

    function displayScenarioOptions(options) {
        appendMessage("Scenario Options:");
        options.forEach((option, index) => {
            appendMessage(`${index + 1} - ${option}`);
        });
    }

    function startHorrorScenario() {
        clearTerminal();
        currentScene = "startHorror";
        processIntro();
    }

    function processIntro() {
        appendMessageWithTyping("You find yourself alone in an eerie school's storage room. The flickering fluorescent lights cast eerie shadows on stacks of Chromebooks lined up on shelves. An unsettling silence fills the air, broken only by the sound of your own breathing.", function () {
            displayScenarioOptions(["Search the room", "Try to open the door"]);
        });
    }

// ... (your existing code)

function processSceneInput(input) {
    let isValidCommand = true;

    switch (currentScene) {
        case "startHorror":
            if (input === "1") {
                currentScene = "exploreRoom";
                displayScenarioOptions(["Inspect the room", "Try to open the door"]);
            } else {
                isValidCommand = false;
            }
            break;
        case "exploreRoom":
            if (input === "1") {
                const inventoryContainsPaintingItem = inventory.some(item => item.name === "Mysterious Object");
                if (inventoryContainsPaintingItem) {
                    appendMessageWithTyping("You use the Mysterious Object to break open the unsettling painting on the wall. Inside, you find a key.", function () {
                        const keyItem = {
                            name: "Key",
                            description: "An old rusty key."
                        };
                        addToInventory(keyItem);
                        appendMessageWithTyping("You've added the " + keyItem.name + " to your inventory.", function () {
                            displayScenarioOptions(["Continue searching", "Examine the broken painting", "Go back to the door", "Go back to the beginning"]);
                        });
                    });
                } else {
                    appendMessageWithTyping("You notice an unsettling painting on the wall but don't have the right tool to open it.");
                    displayScenarioOptions(["Continue searching", "Go back to the door", "Go back to the beginning"]);
                }
            } else if (input === "2") {
                appendMessageWithTyping("You choose to continue searching the room but find nothing new.", function () {
                    displayScenarioOptions(["Continue searching", "Go back to the door", "Go back to the beginning"]);
                });
            } else {
                isValidCommand = false;
            }
            break;
        // Add other scenes as needed
        default:
            isValidCommand = false;
            break;
    }

    if (isValidCommand) {
        appendMessage(`Location: ${currentScene}`);
    }

    return isValidCommand;
}

    function clearTerminal() {
    terminal.innerHTML = "";
}

inputElement.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();

        const command = inputElement.value;
        inputElement.value = "";

        // Process the user's command and get a game response
        processUserInput(command);
    }
});

// Start the horror scenario initially
startHorrorScenario();
});
