// changelog.js — loads changelog.json and displays card-style entries
(async function(){
  try {
    const res = await fetch('data/changelog.json');
    const data = await res.json();
    const container = document.getElementById('changelog-list');
    if (!container) return;

    data.entries.forEach(entry => {
      const el = document.createElement('article');
      el.className = 'flex flex-col md:flex-row gap-6 mb-6 p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition';

      const left = document.createElement('div');
      left.className = 'flex-1';
      const date = new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      left.innerHTML = `
        <div class="text-sm text-slate-400 mb-1">${date}</div>
        <h3 class="text-2xl font-semibold mb-2">${entry.title}</h3>
        <div class="flex gap-2 mb-3">${(entry.tags||[]).map(t => `<span class="bg-white/10 px-2 py-1 rounded-md text-xs">${t}</span>`).join('')}</div>
        <p class="text-slate-300">${entry.content}</p>
      `;

      el.appendChild(left);

      if (entry.image) {
        const imgWrap = document.createElement('div');
        imgWrap.className = 'w-full md:w-64 flex-shrink-0';
        imgWrap.innerHTML = `<img src="${entry.image}" alt="${entry.title}" class="w-full h-40 object-cover rounded-xl border border-white/10" />`;
        el.appendChild(imgWrap);
      }

      container.appendChild(el);
    });
  } catch (err) {
    console.error('Failed to load changelog:', err);
    const container = document.getElementById('changelog-list');
    if (container) container.innerHTML = '<p class="text-red-400">Error loading changelog data.</p>';
  }
})();
