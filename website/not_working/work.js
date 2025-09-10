window.addEventListener('DOMContentLoaded', () => {
    // --- Canvas & Simulation Setup ---
    const canvas = document.getElementById('robot-canvas');
    const ctx = canvas.getContext('2d');

    // Field and robot dimensions (inches)
    const FIELD_WIDTH = 96, FIELD_HEIGHT = 48;
    const ROBOT_WIDTH = 8, ROBOT_HEIGHT = 8;

    let pixelsPerInch = 1;

    // Robot state
    let robotX = FIELD_WIDTH / 2;
    let robotY = FIELD_HEIGHT - ROBOT_HEIGHT / 2;
    let robotAngle = 270; // Facing up

    // Simulation state
    let simulationRunning = false;
    let animationFrameId = null;
    let commandQueue = [];
    let currentCommandIndex = 0;
    let commandStartTime = 0;
    let driveSpeed = 50;
    let turnSpeed = 50;

    // --- Responsive Canvas ---
    function resizeCanvas() {
        // Maintain aspect ratio 2:1 (field 96x48 inches)
        const parent = canvas.parentElement;
        let width = parent.offsetWidth;
        let height = width / 2;
        if (height > parent.offsetHeight) {
            height = parent.offsetHeight;
            width = height * 2;
        }
        canvas.width = width;
        canvas.height = height;
        pixelsPerInch = canvas.width / FIELD_WIDTH;
        drawRobot();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- Draw Robot and Field ---
    function drawRobot() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw field boundary
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Robot in field coordinates
        const robotX_px = robotX * pixelsPerInch;
        const robotY_px = robotY * pixelsPerInch;
        const robotW_px = ROBOT_WIDTH * pixelsPerInch;
        const robotH_px = ROBOT_HEIGHT * pixelsPerInch;

        ctx.save();
        ctx.translate(robotX_px, robotY_px);
        ctx.rotate((robotAngle * Math.PI) / 180);

        // Body
        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(-robotW_px / 2, -robotH_px / 2, robotW_px, robotH_px);
        ctx.strokeStyle = "#0f224d";
        ctx.lineWidth = 2;
        ctx.strokeRect(-robotW_px / 2, -robotH_px / 2, robotW_px, robotH_px);

        // Blade
        const bladeW = robotW_px * 1.2, bladeD = robotH_px * 0.2;
        ctx.fillStyle = "#a0a0a0";
        ctx.strokeStyle = "#505050";
        ctx.fillRect(robotW_px / 2, -bladeW / 2, bladeD, bladeW);
        ctx.strokeRect(robotW_px / 2, -bladeW / 2, bladeD, bladeW);

        // Eyes
        const eyeRad = robotW_px * 0.1, eyeSep = robotW_px * 0.3, eyeBack = robotH_px * 0.2;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(-eyeBack, -eyeSep / 2, eyeRad, 0, Math.PI * 2);
        ctx.arc(-eyeBack, eyeSep / 2, eyeRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "black"; ctx.lineWidth = 1; ctx.stroke();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(-eyeBack + eyeRad * 0.2, -eyeSep / 2 - eyeRad * 0.2, eyeRad * 0.5, 0, Math.PI * 2);
        ctx.arc(-eyeBack + eyeRad * 0.2, eyeSep / 2 - eyeRad * 0.2, eyeRad * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // --- Command Parsing ---
    function parseCode(code) {
        const lines = code.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
        const commands = [];
        lines.forEach(line => {
            if (line.startsWith('drive(') && line.endsWith(')')) {
                const v = parseFloat(line.substring(6, line.length - 1));
                if (!isNaN(v)) commands.push({ type: 'drive', value: v });
            } else if (line.startsWith('turn(') && line.endsWith(')')) {
                const v = parseFloat(line.substring(5, line.length - 1));
                if (!isNaN(v)) commands.push({ type: 'turn', value: v });
            } else if (line.startsWith('wait(') && line.endsWith(')')) {
                const v = parseInt(line.substring(5, line.length - 1));
                if (!isNaN(v)) commands.push({ type: 'wait', value: v });
            } else if (line.startsWith('set_drive_speed(') && line.endsWith(')')) {
                const v = parseInt(line.substring(16, line.length - 1));
                if (!isNaN(v)) commands.push({ type: 'set_drive_speed', value: v });
            } else if (line.startsWith('print_message(') && line.endsWith(')')) {
                const v = line.substring(14, line.length - 1).replace(/['"]/g, '');
                commands.push({ type: 'print_message', value: v });
            } else {
                // Unknown
                commands.push({ type: 'unknown', value: line });
            }
        });
        return commands;
    }

    // --- Simulation Animation ---
    function executeCommand(command, deltaTime) {
        switch (command.type) {
            case 'drive': {
                // Move robot forward by command.value inches
                const speed = driveSpeed / 100 * 0.5; // 0.5 inches/ms base
                let moved = command.moved || 0;
                let moveTarget = command.value;
                let moveThisFrame = Math.min(Math.abs(moveTarget - moved), speed * deltaTime) * Math.sign(moveTarget - moved);
                if (Math.abs(moveThisFrame) < 0.001) moveThisFrame = moveTarget - moved;
                // Compute new position
                const rad = robotAngle * Math.PI / 180;
                let newX = robotX + Math.cos(rad) * moveThisFrame;
                let newY = robotY + Math.sin(rad) * moveThisFrame;
                // Clamp to field
                const halfW = ROBOT_WIDTH / 2, halfH = ROBOT_HEIGHT / 2;
                newX = Math.max(halfW, Math.min(FIELD_WIDTH - halfW, newX));
                newY = Math.max(halfH, Math.min(FIELD_HEIGHT - halfH, newY));
                robotX = newX;
                robotY = newY;
                command.moved = moved + moveThisFrame;
                if (Math.abs(command.moved) >= Math.abs(moveTarget)) command.completed = true;
                break;
            }
            case 'turn': {
                // Turn robot by command.value degrees
                const speed = turnSpeed / 100 * 0.5; // 0.5 deg/ms base
                let turned = command.turned || 0;
                let turnTarget = command.value;
                let turnThisFrame = Math.min(Math.abs(turnTarget - turned), speed * deltaTime) * Math.sign(turnTarget - turned);
                if (Math.abs(turnThisFrame) < 0.001) turnThisFrame = turnTarget - turned;
                robotAngle = (robotAngle + turnThisFrame + 360) % 360;
                command.turned = turned + turnThisFrame;
                if (Math.abs(command.turned) >= Math.abs(turnTarget)) command.completed = true;
                break;
            }
            case 'wait': {
                if (!command.startTime) command.startTime = performance.now();
                if (performance.now() - command.startTime >= command.value) command.completed = true;
                break;
            }
            case 'set_drive_speed': {
                driveSpeed = command.value;
                command.completed = true;
                break;
            }
            case 'print_message': {
                // For demo, you can log to a console element
                const consoleOutput = document.getElementById('console-output');
                if (consoleOutput) {
                    const div = document.createElement('div');
                    div.textContent = `Console: ${command.value}`;
                    consoleOutput.appendChild(div);
                }
                command.completed = true;
                break;
            }
            case 'unknown': {
                const consoleOutput = document.getElementById('console-output');
                if (consoleOutput) {
                    const div = document.createElement('div');
                    div.textContent = `Unknown command: ${command.value}`;
                    div.style.color = "orange";
                    consoleOutput.appendChild(div);
                }
                command.completed = true;
                break;
            }
        }
    }

    let lastTime = 0;
    function animateSimulation(time) {
        if (!simulationRunning) return;
        const deltaTime = time - lastTime;
        lastTime = time;
        if (currentCommandIndex < commandQueue.length) {
            const command = commandQueue[currentCommandIndex];
            executeCommand(command, deltaTime);
            if (command.completed) currentCommandIndex++;
        } else {
            simulationRunning = false;
            // Log finished to console
            const consoleOutput = document.getElementById('console-output');
            if (consoleOutput) {
                const div = document.createElement('div');
                div.textContent = "Program Finished";
                div.style.color = "#1e3a8a";
                consoleOutput.appendChild(div);
            }
        }
        drawRobot();
        animationFrameId = requestAnimationFrame(animateSimulation);
    }

    // --- Control Buttons ---
    document.getElementById('run-button')?.addEventListener('click', () => {
        // Reset simulation state
        simulationRunning = false;
        cancelAnimationFrame(animationFrameId);
        commandQueue = parseCode(document.getElementById('code-editor').value);
        currentCommandIndex = 0;
        lastTime = performance.now();
        // Clear console
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) consoleOutput.innerHTML = '';
        // Log compiled
        if (consoleOutput) {
            const div = document.createElement('div');
            div.textContent = "Program Compiled";
            div.style.color = "#1e3a8a";
            consoleOutput.appendChild(div);
        }
        // Start simulation
        simulationRunning = true;
        animationFrameId = requestAnimationFrame(animateSimulation);
    });

    document.getElementById('reset-button')?.addEventListener('click', () => {
        simulationRunning = false;
        cancelAnimationFrame(animationFrameId);
        robotX = FIELD_WIDTH / 2;
        robotY = FIELD_HEIGHT - ROBOT_HEIGHT / 2;
        robotAngle = 270;
        drawRobot();
        // Clear console
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) consoleOutput.innerHTML = '';
    });

    document.getElementById('start-left-button')?.addEventListener('click', () => {
        simulationRunning = false;
        cancelAnimationFrame(animationFrameId);
        robotX = ROBOT_WIDTH / 2;
        robotY = FIELD_HEIGHT - ROBOT_HEIGHT / 2;
        robotAngle = 270;
        drawRobot();
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) {
            const div = document.createElement('div');
            div.textContent = "Robot started from left";
            consoleOutput.appendChild(div);
        }
    });

    document.getElementById('start-right-button')?.addEventListener('click', () => {
        simulationRunning = false;
        cancelAnimationFrame(animationFrameId);
        robotX = FIELD_WIDTH - ROBOT_WIDTH / 2;
        robotY = FIELD_HEIGHT - ROBOT_HEIGHT / 2;
        robotAngle = 270;
        drawRobot();
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) {
            const div = document.createElement('div');
            div.textContent = "Robot started from right";
            consoleOutput.appendChild(div);
        }
    });

    // Initial draw
    drawRobot();
});
