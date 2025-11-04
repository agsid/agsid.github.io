
$(document).ready(function() {

  // Load partials into their containers
  $('#navbar').load('./partials/Navbar.html');
  $('#sidebar').load('./partials/Sidebar.html');

  // Theme toggle (optional)
  const toggleTheme = () => {
    const current = $('html').attr('data-theme');
    $('html').attr('data-theme', current === 'dark' ? 'light' : 'dark');
  };

  // Example: attach toggle to a button with id="themeToggle"
  $('#themeToggle').on('click', toggleTheme);

});
