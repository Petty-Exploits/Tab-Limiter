// Select the button, message, and funny pictures elements
const setLimitButton = document.getElementById("setLimitButton");
const saveMessage = document.getElementById("saveMessage");
const funnyPictures = document.getElementById("funnyPictures");

// Initialize the page in dark mode
document.body.classList.add("dark-mode");

// Attach a click event listener to the button
setLimitButton.addEventListener("click", function () {
    // Show the "Changes saved" message
    saveMessage.style.display = "block";

    // Simulate saving the tab limit (in a humorous way)
    setTimeout(function () {
        // Redirect to the Rick Astley video
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }, 1000); // Delay the redirection for 1 second
});

// Attach a click event listener to the dark mode toggle button
document.getElementById("darkModeToggle").addEventListener("click", function () {
    // Toggle between dark mode and light mode
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");

    // Show the funny pictures in light mode
    if (document.body.classList.contains("light-mode")) {
        funnyPictures.classList.remove("hidden");
    } else {
        funnyPictures.classList.add("hidden");
    }
});
