// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Helper function to load and save data
const loadData = () => JSON.parse(fs.readFileSync('data.json', 'utf8'));
const saveData = (data) => fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const route = parsedUrl.pathname === '/' ? 'home' : parsedUrl.pathname.slice(1);

  // Handle saving updates from browser (POST)
  if (req.method === 'POST' && route === 'save') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { page, title, message } = JSON.parse(body);
      const data = loadData();
      if (data[page]) {
        data[page].title = title;
        data[page].message = message;
        saveData(data);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // Load data for requested route
  const data = loadData();
  const pageData = data[route] || { title: "404 Not Found", message: "This page doesn't exist." };

  // Serve HTML page with inline edit option
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${pageData.title}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 10vh; }
        nav a { margin: 0 10px; text-decoration: none; color: #0077b6; }
        h1[contenteditable], p[contenteditable] {
          border: 1px dashed #ccc;
          padding: 5px;
        }
        button { margin-top: 10px; padding: 8px 16px; cursor: pointer; }
      </style>
    </head>
    <body>
      <nav>
        <a href="/">Home</a> |
        <a href="/about">About</a> |
        <a href="/contact">Contact</a>
      </nav>
      <h1 contenteditable="true" id="title">${pageData.title}</h1>
      <p contenteditable="true" id="message">${pageData.message}</p>
      <button onclick="saveChanges()">💾 Save Changes</button>

      <script>
        async function saveChanges() {
          const title = document.getElementById('title').innerText;
          const message = document.getElementById('message').innerText;
          const page = "${route}";
          const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page, title, message })
          });
          if (response.ok) alert('Saved!');
        }
      </script>
    </body>
    </html>
  `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
    