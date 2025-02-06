// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Function to load dark mode preference
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const toggle = document.getElementById('dark-mode-toggle');
    if (darkMode) {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        toggle.checked = false;
    }
}

// Event listener for the dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('change', toggleDarkMode);

// Load dark mode preference when the page loads
window.addEventListener('load', loadDarkModePreference);

function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    navLinks.classList.toggle("active");
}