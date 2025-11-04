const mainContent = document.getElementById("main-content");

// Sections
const sections = [
  { id: "introduction", title: "Introduction", content: "JavaScript is a versatile programming language that runs in browsers and on servers." },
  { id: "syntax", title: "Syntax & Structure", content: "Learn about variables, loops, conditionals, and how to structure JS code." },
  { id: "control-flow", title: "Control Flow", content: "Understand if/else, switch statements, loops, and logical operators." },
  { id: "functions", title: "Functions", content: "Functions encapsulate reusable code blocks for modularity and clarity." },
  { id: "objects-arrays", title: "Objects & Arrays", content: "Objects store key-value pairs. Arrays store ordered lists of items." },
  { id: "es6", title: "ES6+ Features", content: "Modern JavaScript introduces let/const, arrow functions, template literals, modules, and more." },
];

// Generate content
let contentHTML = '';
sections.forEach(sec => {
  contentHTML += `
    <section id="${sec.id}" class="space-y-4">
      <h2 class="text-2xl font-semibold mt-6">${sec.title}</h2>
      <p class="text-gray-400">${sec.content}</p>
    </section>
  `;
});

mainContent.innerHTML = `
  <h1 class="text-4xl font-bold mb-4">Getting Started with JavaScript</h1>
  <p class="text-gray-400 mb-6">Welcome to the JavaScript documentation. This section covers the basics of JavaScript.</p>
  ${contentHTML}
`;

// Highlight active link in sidebar
const sidebarLinks = document.querySelectorAll("#sidebar-links a[href^='#']");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => {
    const sectionTop = document.getElementById(sec.id).offsetTop - 120;
    if (scrollY >= sectionTop) current = sec.id;
  });
  sidebarLinks.forEach(link => {
    link.classList.remove("active-link");
    if (link.getAttribute("href") === `#${current}`) link.classList.add("active-link");
  });
});
