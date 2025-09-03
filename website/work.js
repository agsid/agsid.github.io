window.addEventListener('DOMContentLoaded', () => {
    // Redirect Docs Button
    document.getElementById('docs-button')?.addEventListener('click', () => {
        window.location.href = "https://agsid.github.io/website/docs.html";
    });

    // --- Line numbers and localStorage ---
    const codeEditor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('editor-line-numbers');
    const STORAGE_KEY = 'fll-bot-editor-code';

    function updateLineNumbers() {
        const code = codeEditor.value;
        const lines = code.split('\n').length || 1;
        let html = '';
        for (let i = 1; i <= lines; i++) html += i + '<br>';
        lineNumbers.innerHTML = html;
    }

    if (codeEditor) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) codeEditor.value = saved;
        updateLineNumbers();
        codeEditor.addEventListener('input', () => {
            localStorage.setItem(STORAGE_KEY, codeEditor.value);
            updateLineNumbers();
        });
    }

    // --- Slide arrows ---
    function setupPanelSliding(panelId, outBtnId, inBtnId, slidClass) {
        const panel = document.getElementById(panelId);
        const outBtn = document.getElementById(outBtnId);
        const inBtn = document.getElementById(inBtnId);
        outBtn?.addEventListener('click', () => {
            panel.classList.add(slidClass);
            outBtn.style.display = 'none';
            inBtn.style.display = 'block';
        });
        inBtn?.addEventListener('click', () => {
            panel.classList.remove(slidClass);
            inBtn.style.display = 'none';
            outBtn.style.display = 'block';
        });
    }
    setupPanelSliding('editor-panel', 'editor-slide-out', 'editor-slide-in', 'slid-out');
    setupPanelSliding('sim-panel', 'sim-slide-out', 'sim-slide-in', 'slid-out');

    // --- Copy Python code to clipboard ---
    const copyBtn = document.getElementById('copy-button');
    copyBtn?.addEventListener('click', () => {
        if (codeEditor) {
            navigator.clipboard.writeText(codeEditor.value)
                .then(() => showMessage('Copied Python code to clipboard!'))
                .catch(() => showMessage('Failed to copy to clipboard.'));
        }
    });

    function showMessage(msg) {
        let box = document.getElementById('message-box');
        box.textContent = msg;
        box.style.display = 'block';
        setTimeout(() => { box.style.display = 'none'; }, 1800);
    }

    // --- Console Output ---
    const consoleOutput = document.getElementById('console-output');
    function logToConsole(msg, type = "info") {
        const div = document.createElement('div');
        div.textContent = msg;
        div.className = "console-line " + type;
        consoleOutput.appendChild(div);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
    function clearConsole() { consoleOutput.innerHTML = ""; }

    // --- Canvas Simulation (robot) ---
    const canvas = document.getElementById('robot-canvas');
    const ctx = canvas.getContext('2d');
    let robot = { x: 250, y: 220, angle: 0, color: "#aee2f3" };

    function drawRobot() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw background obstacles
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(60, 300, 80, Math.PI, Math.PI*1.5);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(440, 300, 80, Math.PI*1.5, 0);
        ctx.fill();
        // Draw robot body
        ctx.save();
        ctx.translate(robot.x, robot.y);
        ctx.rotate(robot.angle * Math.PI / 180);
        ctx.fillStyle = robot.color;
        ctx.fillRect(-35, -20, 70, 40); // body
        ctx.beginPath();
        ctx.arc(0, -30, 24, 0, 2 * Math.PI); // head
        ctx.fill();
        ctx.strokeStyle = "#222";
        ctx.stroke();
        // Eyes
        ctx.beginPath();
        ctx.arc(-12, -32, 7, 0, 2 * Math.PI);
        ctx.arc(12, -32, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "#00b4d8";
        ctx.fill();
        ctx.stroke();
        // Wheels
        ctx.fillStyle = "#222";
        ctx.fillRect(-30, 20, 20, 18);
        ctx.fillRect(10, 20, 20, 18);
        // Arms
        ctx.fillStyle = robot.color;
        ctx.fillRect(-45, -15, 10, 32);
        ctx.fillRect(35, -15, 10, 32);
        ctx.restore();
    }

    function resetRobot(pos = "center") {
        robot = {
            x: pos === "left" ? 60 : (pos === "right" ? 440 : 250),
            y: 220,
            angle: 0,
            color: "#aee2f3"
        };
        drawRobot();
    }
    resetRobot();

    document.getElementById('start-left-button')?.addEventListener('click', () => {
        resetRobot("left");
        logToConsole("Robot started from left.", "status");
    });
    document.getElementById('start-right-button')?.addEventListener('click', () => {
        resetRobot("right");
        logToConsole("Robot started from right.", "status");
    });

    // --- Run simulation from code ---
    document.getElementById('run-button')?.addEventListener('click', () => {
        clearConsole();
        logToConsole("Program Compiled", "status");
        resetRobot();
        const code = codeEditor.value;
        const lines = code.split('\n');
        let outOfBounds = false;

        for (let idx = 0; idx < lines.length; idx++) {
            const line = lines[idx].trim();
            if (!line || line.startsWith("#")) continue;
            // Command parsing
            const cmdMatch = line.match(/^([a-zA-Z_]+)\(([^)]*)\)/);
            if (!cmdMatch) {
                logToConsole(`Line ${idx+1}: Invalid command syntax.`, "error");
                continue;
            }
            const cmd = cmdMatch[1];
            const args = cmdMatch[2].split(',').map(s => s.trim());

            // Supported commands
            switch (cmd) {
                case "speed":
                    logToConsole(`Line ${idx+1}: Drivetrain speed set to ${args[0]}%.`, "info");
                    break;
                case "drive":
                    let distance = parseInt(args[0], 10);
                    robot.x += Math.cos(robot.angle * Math.PI / 180) * distance;
                    robot.y += Math.sin(robot.angle * Math.PI / 180) * distance;
                    logToConsole(`Line ${idx+1}: Robot drove ${distance}px.`, "info");
                    break;
                case "turn":
                    let turnDeg = parseInt(args[0], 10);
                    robot.angle += turnDeg;
                    logToConsole(`Line ${idx+1}: Robot turned ${turnDeg} degrees.`, "info");
                    break;
                case "speed_motor":
                    logToConsole(`Line ${idx+1}: Arm motor speed set to ${args[0]}%.`, "info");
                    break;
                case "turn_motor":
                    logToConsole(`Line ${idx+1}: Robot arm on port ${args[0]} turned ${args[1]} degrees.`, "info");
                    break;
                case "wait":
                    logToConsole(`Line ${idx+1}: Waiting for ${args[0]} ms.`, "info");
                    break;
                case "print":
                    logToConsole(`Console: ${args.join(',').replace(/['"]/g, "")}`, "console");
                    break;
                default:
                    logToConsole(`Line ${idx+1}: Unknown command "${cmd}".`, "error");
            }
            // Out of bounds check
            if (robot.x < 0 || robot.x > canvas.width || robot.y < 0 || robot.y > canvas.height) {
                outOfBounds = true;
                logToConsole(`Line ${idx+1}: Robot Out of Bounds!`, "alert");
                break;
            }
            drawRobot();
        }
        if (!outOfBounds) logToConsole("Program Finished", "status");
    });
});