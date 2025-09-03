window.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Setup: Draw simple robot for testing ---
    const canvas = document.getElementById('robot-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw ground scene
        ctx.fillStyle = "#bfc4ca";
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

        // Draw left and right white "walls"
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, canvas.height - 80, 80, 40);
        ctx.fillRect(canvas.width - 80, canvas.height - 80, 80, 40);

        // Draw robot (simple representation)
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height - 80);
        // body
        ctx.fillStyle = "#7fcaff";
        ctx.fillRect(-22, -22, 44, 36);
        // eyes
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(-10, -12, 7, 0, 2 * Math.PI);
        ctx.arc(10, -12, 7, 0, 2 * Math.PI);
        ctx.fill();
        // wheels
        ctx.fillStyle = "#333";
        ctx.fillRect(-22, 14, 14, 9);
        ctx.fillRect(8, 14, 14, 9);
        ctx.restore();
    }

    // --- Editor line numbers ---
    const codeEditor = document.getElementById('code-editor');
    const editorLines = document.getElementById('editor-line-numbers');
    function updateLineNumbers() {
        if (!codeEditor || !editorLines) return;
        const lines = codeEditor.value.split('\n').length || 1;
        editorLines.textContent = Array.from({length: lines}, (_, i) => i + 1).join('\n');
    }
    if (codeEditor && editorLines) {
        codeEditor.addEventListener('input', updateLineNumbers);
        codeEditor.addEventListener('scroll', () => {
            editorLines.scrollTop = codeEditor.scrollTop;
        });
        updateLineNumbers();
    }

    // --- Save editor code to localStorage and restore ---
    const STORAGE_KEY = 'fll-bot-editor-code';
    if (codeEditor) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) codeEditor.value = saved;
        codeEditor.addEventListener('input', () => {
            localStorage.setItem(STORAGE_KEY, codeEditor.value);
        });
        updateLineNumbers();
    }

    // --- Copy Python code to clipboard ---
    const copyBtn = document.getElementById('copy-button');
    const pythonCodeDisplay = document.getElementById('python-code-display');
    copyBtn?.addEventListener('click', () => {
        if (pythonCodeDisplay) {
            navigator.clipboard.writeText(pythonCodeDisplay.value)
                .then(() => showMessage('Copied Python code to clipboard!'))
                .catch(() => showMessage('Failed to copy to clipboard.'));
        }
    });

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
        setTimeout(() => {
            box.style.display = 'none';
        }, 1800);
    }

    // --- Example: Run/Reset/Start buttons (add your own logic here) ---
    document.getElementById('run-button')?.addEventListener('click', () => showMessage('Run simulation!'));
    document.getElementById('reset-button')?.addEventListener('click', () => showMessage('Simulation reset.'));
    document.getElementById('start-left-button')?.addEventListener('click', () => showMessage('Started from left.'));
    document.getElementById('start-right-button')?.addEventListener('click', () => showMessage('Started from right.'));
});