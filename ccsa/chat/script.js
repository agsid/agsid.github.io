(function(){
  const search = document.getElementById('search');
  const toc = document.getElementById('toc');

  // Simple TOC search filter
  search.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase().trim();
    const items = toc.querySelectorAll('a');
    items.forEach(a=>{
      const show = a.textContent.toLowerCase().includes(q);
      a.style.display = show ? 'block' : 'none';
    });
  });

  // Cmd/Ctrl+K to focus search
  window.addEventListener('keydown', (e)=>{
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k'){
      e.preventDefault();
      search.focus();
    }
  });
})(); 