// Load partials
Promise.all([
  fetch('docs/partials/Navbar.html').then(r => r.text()),
  fetch('docs/partials/sidebar.html').then(r => r.text())
]).then(([nav, side]) => {
  document.getElementById('navbar').innerHTML = nav;
  document.getElementById('sidebar').innerHTML = side;
});

// Theme toggle (optional)
const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data‑theme');
  document.documentElement.setAttribute('data‑theme', current === 'dark' ? 'light' : 'dark');
};
// Maybe attach toggle to a button in navbar
