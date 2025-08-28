const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
        mobileNavItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});
