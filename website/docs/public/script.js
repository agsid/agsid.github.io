// Load content dynamically
async function loadContent() {
    const res = await fetch('/content.json');
    const data = await res.json();
    const titleEl = document.getElementById('title');
    const descEl = document.getElementById('description');
    const titleInput = document.getElementById('titleInput');
    const descInput = document.getElementById('descInput');

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.description;
    if (titleInput) titleInput.value = data.title;
    if (descInput) descInput.value = data.description;
}

loadContent();

// Handle form submission on edit page
const form = document.getElementById('editForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('titleInput').value;
        const description = document.getElementById('descInput').value;

        await fetch('/content.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        window.location.href = '/index.html';
    });
}
