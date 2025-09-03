window.addEventListener('DOMContentLoaded', () => {
    // --- Canvas and other setup here if needed ---

    // 1. Copy Python code to clipboard
    const copyBtn = document.getElementById('copy-button');
    const pythonCodeDisplay = document.getElementById('python-code-display');
    copyBtn?.addEventListener('click', () => {
        if (pythonCodeDisplay) {
            navigator.clipboard.writeText(pythonCodeDisplay.value)
                .then(() => showMessage('Copied Python code to clipboard!'))
                .catch(() => showMessage('Failed to copy to clipboard.'));
        }
    });

    // 2. Save editor code to localStorage and restore on load
    const codeEditor = document.getElementById('code-editor');
    const STORAGE_KEY = 'fll-bot-editor-code';

    // Restore saved code
    if (codeEditor) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) codeEditor.value = saved;
        codeEditor.addEventListener('input', () => {
            localStorage.setItem(STORAGE_KEY, codeEditor.value);
        });
    }

    // --- Utility: show message ---
    function showMessage(msg) {
        let box = document.getElementById('message-box');
        if (!box) {
            box = document.createElement('div');
            box.id = 'message-box';
            document.body.appendChild(box);
        }
        box.textContent = msg;
        box.style.display = 'block';
        box.style.position = 'fixed';
        box.style.top = '24px';
        box.style.right = '24px';
        box.style.background = '#292929';
        box.style.color = '#fff';
        box.style.padding = '14px 22px';
        box.style.borderRadius = '16px';
        box.style.boxShadow = '0 2px 18px #0007';
        box.style.fontSize = '1.1rem';
        box.style.zIndex = 1000;
        setTimeout(() => {
            box.style.display = 'none';
        }, 1800);
    }
});