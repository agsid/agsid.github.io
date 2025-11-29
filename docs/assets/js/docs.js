

// Generate Sidebar
const sidebarNav = document.getElementById("sidebar-nav");
const mainContent = document.getElementById("docs-container");

function createSidebarItem(item) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#"+item.title.replace(/\s+/g,'-');
  a.textContent = item.title;
  li.appendChild(a);

  if(item.children && item.children.length > 0) {
    const ul = document.createElement("ul");
    ul.style.paddingLeft = "1rem";
    item.children.forEach(child => {
      ul.appendChild(createSidebarItem(child));
    });
    li.appendChild(ul);
  }

  return li;
}

// Populate sidebar
const ulRoot = document.createElement("ul");
docsStructure.forEach(item => ulRoot.appendChild(createSidebarItem(item)));
sidebarNav.appendChild(ulRoot);

// Generate main content
docsStructure.forEach(item => {
  const section = document.createElement("section");
  const h2 = document.createElement("h2");
  h2.id = item.title.replace(/\s+/g,'-');
  h2.textContent = item.title;
  section.appendChild(h2);

  // If commands, list children
  if(item.children && item.children.length > 0){
    item.children.forEach(child => {
      const h3 = document.createElement("h3");
      h3.id = child.title.replace(/\s+/g,'-');
      h3.textContent = child.title;
      section.appendChild(h3);
      const p = document.createElement("p");
      p.textContent = "Description for " + child.title;
      section.appendChild(p);
    });
  } else {
    const p = document.createElement("p");
    p.textContent = "Description for " + item.title;
    section.appendChild(p);
  }

  mainContent.appendChild(section);
});
