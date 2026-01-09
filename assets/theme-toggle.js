(function() {
  const lightTheme = document.getElementById('light-theme');
  const darkTheme = document.getElementById('dark-theme');
  const themeToggle = document.getElementById('theme-toggle');
  
  // Get saved theme preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  // Apply saved theme on page load
  function applyTheme(theme) {
    if (theme === 'light') {
      lightTheme.disabled = false;
      darkTheme.disabled = true;
      themeToggle.classList.remove('dark-mode');
      themeToggle.classList.add('light-mode');
    } else {
      lightTheme.disabled = true;
      darkTheme.disabled = false;
      themeToggle.classList.remove('light-mode');
      themeToggle.classList.add('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }
  
  // Initialize theme
  applyTheme(savedTheme);
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', function() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
})();

