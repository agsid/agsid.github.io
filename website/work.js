// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const codeEditor = document.getElementById('code-editor');
    const highlightOverlay = document.getElementById('highlight-overlay');
    const runButton = document.getElementById('run-button');
    const resetButton = document.getElementById('reset-button');
    const copyButton = document.getElementById('copy-button');
    const uploadButton = document.getElementById('upload-button');
    const fileUploadInput = document.getElementById('file-upload');
    const pythonCodeDisplay = document.getElementById('python-code-display');
    const canvas = document.getElementById('robot-canvas');
    const ctx = canvas.getContext('2d');
    const messageBox = document.getElementById('message-box');
    const consoleOutput = document.getElementById('console-output');

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const mainContentArea = document.getElementById('main-content-area');

    // Settings Dropdown Elements
    const settingsDropdown = document.getElementById('settings-dropdown');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsMenu = document.getElementById('settings-menu');
    const themeModeToggleBtn = document.getElementById('theme-mode-toggle');

    // New Start Position Buttons
    const startLeftButton = document.getElementById('start-left-button');
    const startRightButton = document.getElementById('start-right-button');

    // Robot Specification elements
    const wheelDiameterInput = document.getElementById('wheel-diameter');
    const motorDegreesPerRotationInput = document.getElementById('motor-degrees-per-rotation');
    const leftMotorPortSelect = document.getElementById('left-motor-port');
    const rightMotorPortSelect = document.getElementById('right-motor-port');

    // Modal Elements
    const uploadModalOverlay = document.getElementById('upload-modal-overlay');
    const modalCloseButton = document.getElementById('modal-close-button');
    const modalUploadFileButton = document.getElementById('modal-upload-file-button');
    const pasteCodeTextarea = document.getElementById('paste-code-textarea');
    const modalPasteCodeButton = document.getElementById('modal-paste-code-button');


    // --- Constants for FLL Field and Conversion ---
    const CANVAS_WIDTH_INCHES = 96; // Standard FLL field width (inches)
    const CANVAS_HEIGHT_INCHES = 48; // Standard FLL field height (inches)
    let PIXELS_PER_INCH; // Calculated dynamically

    // Robot properties
    const ROBOT_WIDTH_INCHES = 8;
    const ROBOT_HEIGHT_INCHES = 8;
    let robotX;
    let robotY;
    let robotAngle; // 0 degrees is facing right, 90 is up (positive Y), 270 is up (negative Y)
    let currentDriveSpeed = 50; // Default drive speed (0-100)
    let currentTurnSpeed = 50; // Default turn speed (0-100)
    const motorStates = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 }; // 0-100 power, added E and F

    // Robot Specification state
    let robotSpecs = {
        wheelDiameter: null,
        motorDegreesPerRotation: null,
        leftMotorPort: 'B',
        rightMotorPort: 'C'
    };

    // Auto-correction state - ALWAYS ENABLED
    const autoCorrectionEnabled = true;

    // Animation and Simulation variables
    let animationFrameId = null;
    let simulationRunning = false;
    let commandQueue = [];
    let currentCommandIndex = 0;
    let commandStartTime = 0;

    // --- Helper Functions ---
    function showMessage(message, isError = false) {
        messageBox.textContent = message;
        messageBox.className = 'message-box show';
        if (isError) {
            messageBox.classList.add('error');
        } else {
            messageBox.classList.remove('error');
        }
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 3000);
    }

    function logToConsole(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const messageElement = document.createElement('div');
        messageElement.className = `console-line`;
        messageElement.innerHTML = `<span class="console-timestamp">${timestamp}</span><span style="color: var(--console-text);">${message}</span>`;
        consoleOutput.appendChild(messageElement);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // --- Syntax Highlighting Functionality ---
    function highlightCode() {
        const code = codeEditor.value;
        let highlightedHtml = code;

        highlightedHtml = highlightedHtml.replace(/&/g, '&amp;')
                                         .replace(/</g, '&lt;')
                                         .replace(/>/g, '&gt;');

        highlightedHtml = highlightedHtml.replace(/(\/\/.*)/g, '<span class="comment-highlight">$1</span>');
        highlightedHtml = highlightedHtml.replace(/\b(drive|set_drive_speed)\b/g, '<span class="movement-highlight">$&</span>');
        highlightedHtml = highlightedHtml.replace(/\b(turn)\b/g, '<span class="turn-highlight">$&</span>');
        highlightedHtml = highlightedHtml.replace(/\b(set_motor_power|stop_motor)\b/g, '<span class="arm-command-highlight">$&</span>');

        highlightOverlay.innerHTML = highlightedHtml;
    }

    codeEditor.addEventListener('input', highlightCode);
    codeEditor.addEventListener('scroll', () => {
        highlightOverlay.scrollTop = codeEditor.scrollTop;
    });

    highlightCode(); // Initial highlight on load


    // --- Tab Switching Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.dataset.tabTarget;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTabId).classList.add('active');
            if (targetTabId === 'tab-content-editor') {
                resizeCanvas();
            }
        });
    });

    // --- Theme Toggle ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeModeToggleBtn.querySelector('span').textContent = 'Light Mode';
            themeModeToggleBtn.querySelector('ion-icon').setAttribute('name', 'sunny-outline');
        } else {
            document.body.classList.remove('dark-mode');
            themeModeToggleBtn.querySelector('span').textContent = 'Dark Mode';
            themeModeToggleBtn.querySelector('ion-icon').setAttribute('name', 'moon-outline');
        }
        drawRobot();
        highlightCode();
    }

    themeModeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);


    // --- Settings Dropdown Toggle ---
    settingsToggle.addEventListener('click', () => {
        settingsMenu.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!settingsDropdown.contains(event.target)) {
            settingsMenu.classList.remove('open');
        }
    });


    // --- Robot Canvas Drawing ---
    function resizeCanvas() {
        const simulationPanel = document.getElementById('simulation-panel');
        if (simulationPanel.offsetParent === null) {
            // Panel is not visible, no need to resize canvas
            return;
        }

        const panelWidth = simulationPanel.clientWidth - (1.5 * 16 * 2); // Adjust for padding
        const availableHeight = simulationPanel.clientHeight;

        const h2Height = document.querySelector('#simulation-panel h2')?.offsetHeight || 0;
        const h3Height = document.querySelector('#simulation-panel h3')?.offsetHeight || 0;
        const consoleHeight = consoleOutput.offsetHeight || 0;
        const buttonSectionHeight = document.querySelector('#simulation-panel .flex.justify-center.space-x-4.mt-6')?.offsetHeight || 0;
        const verticalPadding = (1.5 * 16 * 2); // Panel padding

        const remainingHeightForCanvas = availableHeight - h2Height - h3Height - consoleHeight - buttonSectionHeight - verticalPadding - 32; // Additional buffer

        let canvasRenderWidth = panelWidth;
        let canvasRenderHeight = panelWidth / (CANVAS_WIDTH_INCHES / CANVAS_HEIGHT_INCHES); // Maintain aspect ratio

        if (canvasRenderHeight > remainingHeightForCanvas) {
            canvasRenderHeight = remainingHeightForCanvas;
            canvasRenderWidth = remainingHeightForCanvas * (CANVAS_WIDTH_INCHES / CANVAS_HEIGHT_INCHES);
        }
        
        // Ensure minimum dimensions or handle very small sizes
        const minCanvasWidth = 300; // Minimum width
        const minCanvasHeight = minCanvasWidth / (CANVAS_WIDTH_INCHES / CANVAS_HEIGHT_INCHES);

        if (canvasRenderWidth < minCanvasWidth) {
            canvasRenderWidth = minCanvasWidth;
            canvasRenderHeight = minCanvasHeight;
        }

        canvas.width = canvasRenderWidth;
        canvas.height = canvasRenderHeight;
        PIXELS_PER_INCH = canvas.width / CANVAS_WIDTH_INCHES;

        drawRobot();
    }

    function drawRobot() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--canvas-border').trim();
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Convert robot coordinates from inches to pixels (origin is top-left for canvas)
        const robotX_px = robotX * PIXELS_PER_INCH;
        const robotY_px = robotY * PIXELS_PER_INCH;
        const robotWidth_px = ROBOT_WIDTH_INCHES * PIXELS_PER_INCH;
        const robotHeight_px = ROBOT_HEIGHT_INCHES * PIXELS_PER_INCH;

        ctx.save();
        // Translate to the center of the robot for rotation
        ctx.translate(robotX_px, robotY_px);
        // Rotate. Note: Canvas rotation is clockwise, robotAngle is 0=right, 90=up.
        // To make 0 degrees point right on canvas and rotate correctly, use (robotAngle - 90) * Math.PI / 180
        // Or, if 90 is 'up' in your FLL context, and canvas Y is down, then angle needs careful adjustment.
        // Assuming 0 degrees is positive X (right) and 90 degrees is positive Y (down) for canvas rotation.
        // If FLL robot 90 is 'up' (negative Y direction on canvas usually), then:
        // Adjust angle for canvas: `(robotAngle - 90)` because canvas 0 is right, 90 is down.
        // If robotAngle 270 is 'up' (positive Y in FLL coordinate but negative Y in canvas), then 270-90 = 180 (upside down).
        // Let's stick to consistent interpretation: 0 degrees is right (positive X), 90 degrees is up (negative Y on canvas).
        // If robotAngle in FLL is 0 = right, 90 = up.
        // Canvas uses: 0 = right, 90 = down, 180 = left, 270 = up.
        // So, if robotAngle is 90 (up), canvas angle should be 270.
        // Conversion: canvasAngle = (450 - robotAngle) % 360  (to map 90 to 270, 0 to 90 etc.)
        // No, simplest is to define robotAngle 0 as RIGHT, 90 as UP. And canvas 0 as right, 90 as DOWN.
        // So `robotAngle` needs to be mapped to `-(robotAngle - 90)` if 90 is up and canvas is Y-down,
        // or just `robotAngle` if `robotAngle` is already compatible with canvas (0 right, 90 down).
        // Let's assume `robotAngle` is already 0: Right, 90: Up (in FLL coord system).
        // Canvas rotation is CW. FLL angle 90 (up) needs canvas angle -90 (or 270).
        // FLL angle 0 (right) needs canvas angle 0.
        // FLL angle 180 (left) needs canvas angle 180.
        // FLL angle 270 (down) needs canvas angle 90.
        // This means `canvasAngle = (360 - robotAngle) % 360` if robotAngle is CCW from X-axis, 0=right, 90=up.
        // If robotAngle 0=Right, 90=Up (FLL convention), then for canvas (Y-down, CW rotation):
        // 0 (FLL right) -> 0 (canvas right)
        // 90 (FLL up) -> 270 (canvas up)
        // 180 (FLL left) -> 180 (canvas left)
        // 270 (FLL down) -> 90 (canvas down)
        // So, `canvasAngle = (robotAngle + 90) % 360` relative to the robot's front.
        // And `robotAngle` in code is: 0=right, 90=up, 180=left, 270=down.
        // Let's adjust rotation logic for clarity. If robotAngle is "heading" (0=right, 90=up, 180=left, 270=down),
        // and canvas has Y increasing downwards:
        // A simple way is to use `(robotAngle - 90)` for the visual rotation, assuming 90 is 'up'.
        // If 270 is "up" from robot.html initial state:
        ctx.rotate(((robotAngle - 270) * Math.PI) / 180); // Adjust to make the robot 'front' point correctly.

        ctx.fillStyle = '#1e3a8a'; // Robot body color
        ctx.fillRect(-robotWidth_px / 2, -robotHeight_px / 2, robotWidth_px, robotHeight_px);
        ctx.strokeStyle = '#0f224d'; // Robot body border
        ctx.lineWidth = 2;
        ctx.strokeRect(-robotWidth_px / 2, -robotHeight_px / 2, robotWidth_px, robotHeight_px);

        // Simple 'blade' or front attachment for direction
        const bladeTotalWidth_px = robotWidth_px * 1.2;
        const bladeDepth_px = robotHeight_px * 0.2;

        ctx.fillStyle = '#a0a0a0'; // Blade color
        ctx.strokeStyle = '#505050'; // Blade border
        ctx.lineWidth = 2;
        ctx.fillRect(robotWidth_px / 2, -bladeTotalWidth_px / 2, bladeDepth_px, bladeTotalWidth_px);
        ctx.strokeRect(robotWidth_px / 2, -bladeTotalWidth_px / 2, bladeDepth_px, bladeTotalWidth_px);

        // Simple 'eyes' or sensors on the back of the robot for orientation
        const eyeRadius_px = robotWidth_px * 0.1;
        const eyeSeparation = robotWidth_px * 0.3;
        const eyeBackOffset = robotHeight_px * 0.2;

        // Left eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-eyeBackOffset, -eyeSeparation / 2, eyeRadius_px, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Left pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-eyeBackOffset + eyeRadius_px * 0.2, -eyeSeparation / 2 - eyeRadius_px * 0.2, eyeRadius_px * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-eyeBackOffset, eyeSeparation / 2, eyeRadius_px, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Right pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-eyeBackOffset + eyeRadius_px * 0.2, eyeSeparation / 2 - eyeRadius_px * 0.2, eyeRadius_px * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // --- Command Execution Functions (Simulated) ---
    function parseCode(code) {
        const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('//'));
        const parsedCommands = [];

        lines.forEach(line => {
            if (line.startsWith('drive(') && line.endsWith(')')) {
                const distance = parseFloat(line.substring(6, line.length - 1));
                if (!isNaN(distance)) {
                    parsedCommands.push({ type: 'drive', value: distance });
                } else {
                    logToConsole(`Error: Invalid distance in drive command: ${line}`, 'error');
                }
            } else if (line.startsWith('turn(') && line.endsWith(')')) {
                const degrees = parseFloat(line.substring(5, line.length - 1));
                if (!isNaN(degrees)) {
                    parsedCommands.push({ type: 'turn', value: degrees });
                } else {
                    logToConsole(`Error: Invalid degrees in turn command: ${line}`, 'error');
                }
            } else if (line.startsWith('wait(') && line.endsWith(')')) {
                const milliseconds = parseInt(line.substring(5, line.length - 1));
                if (!isNaN(milliseconds)) {
                    parsedCommands.push({ type: 'wait', value: milliseconds });
                } else {
                    logToConsole(`Error: Invalid milliseconds in wait command: ${line}`, 'error');
                }
            } else if (line.startsWith('set_motor_power(') && line.endsWith(')')) {
                const parts = line.substring(16, line.length - 1).split(',').map(p => p.trim());
                if (parts.length === 2) {
                    const port = parts[0].replace(/['"]/g, '');
                    const power = parseInt(parts[1]);
                    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(port) && !isNaN(power) && power >= 0 && power <= 100) {
                        parsedCommands.push({ type: 'set_motor_power', port: port, power: power });
                    } else {
                        logToConsole(`Error: Invalid port or power in set_motor_power command: ${line}`, 'error');
                    }
                } else {
                    logToConsole(`Error: Invalid format for set_motor_power command: ${line}`, 'error');
                }
            } else if (line.startsWith('stop_motor(') && line.endsWith(')')) {
                const port = line.substring(11, line.length - 1).replace(/['']/g, '');
                if (['A', 'B', 'C', 'D', 'E', 'F'].includes(port)) {
                    parsedCommands.push({ type: 'stop_motor', port: port });
                } else {
                    logToConsole(`Error: Invalid port in stop_motor command: ${line}`, 'error');
                }
            } else if (line.startsWith('set_drive_speed(') && line.endsWith(')')) {
                const speed = parseInt(line.substring(16, line.length - 1));
                if (!isNaN(speed) && speed >= 0 && speed <= 100) {
                    parsedCommands.push({ type: 'set_drive_speed', value: speed });
                } else {
                    logToConsole(`Error: Invalid speed in set_drive_speed command: ${line}`, 'error');
                }
            } else if (line.startsWith('display_message(') && line.endsWith(')')) {
                const message = line.substring(16, line.length - 1).replace(/['']/g, '');
                parsedCommands.push({ type: 'print_message', value: message });
            } else if (line.startsWith('print_message(') && line.endsWith(')')) {
                const message = line.substring(14, line.length - 1).replace(/['']/g, '');
                parsedCommands.push({ type: 'print_message', value: message });
            }
            else {
                logToConsole(`Warning: Unknown command or syntax error: ${line}`, 'warn');
            }
        });
        return parsedCommands;
    }

    function generatePython(commands) {
        let pythonCode = ``;

        const actualWheelDiameter = robotSpecs.wheelDiameter !== null && !isNaN(robotSpecs.wheelDiameter) ? robotSpecs.wheelDiameter : 2.5;
        const actualMotorDegreesPerRotation = robotSpecs.motorDegreesPerRotation !== null && !isNaN(robotSpecs.motorDegreesPerRotation) ? robotSpecs.motorDegreesPerRotation : 360;

        pythonCode += `from spike import PrimeHub, Motor, MotorPair\n`;
        pythonCode += `from spike.control import wait_for_seconds\n`;
        pythonCode += `from hub import motion_sensor, port\n`;
        pythonCode += `import math\n`;
        pythonCode += `import time\n\n`;

        pythonCode += `hub = PrimeHub()\n`;
        pythonCode += `hub.motion_sensor.reset_yaw_angle() # Reset gyro for consistent heading\n\n`;

        pythonCode += `# Robot physical specifications from Allied Algorithms FLL Bot Programmer\n`;
        pythonCode += `WHEEL_DIAMETER = ${actualWheelDiameter}\n`;
        pythonCode += `LEFT_MOTOR_PORT = '${robotSpecs.leftMotorPort}'\n`;
        pythonCode += `RIGHT_MOTOR_PORT = '${robotSpecs.rightMotorPort}'\n`;
        pythonCode += `WHEEL_CIRCUMFERENCE = math.pi * WHEEL_DIAMETER\n`;
        pythonCode += `ROBOT_TRACK_WIDTH = 10.0 # Approximate distance between wheels (inches) - adjust as needed for your robot\n\n`;

        pythonCode += `# --- Auto Correction System Configuration (Calibration Values) ---\n`;
        pythonCode += `# These values are crucial and must be determined by calibrating your\n`;
        pythonCode += `# specific Spike Prime robot.\n\n`;
        pythonCode += `GYRO_CHANGE_PER_WHEEL_ROTATION_STRAIGHT = 0.5\n`;
        pythonCode += `ANGLE_PER_WHEEL_ROTATION_IN_PLACE = 10.0\n`;
        pythonCode += `MOTOR_DEGREES_PER_WHEEL_ROTATION = ${actualMotorDegreesPerRotation}\n\n`;

        pythonCode += `# Motor Setup for lower-level control\n`;
        pythonCode += `left_motor = port.${robotSpecs.leftMotorPort}.motor\n`;
        pythonCode += `right_motor = port.${robotSpecs.rightMotorPort}.motor\n\n`;

        pythonCode += `# Utility function to get a motor object by port letter\n`;
        pythonCode += `def get_motor_by_port(port_letter):\n`;
        pythonCode += `    if port_letter == 'A': return port.A.motor\n`;
        pythonCode += `    if port_letter == 'B': return port.B.motor\n`;
        pythonCode += `    if port_letter == 'C': return port.C.motor\n`;
        pythonCode += `    if port_letter == 'D': return port.D.motor\n`;
        pythonCode += `    if port_letter == 'E': return port.E.motor\n`;
        pythonCode += `    if port_letter == 'F': return port.F.motor\n`;
        pythonCode += `    return None\n\n`;

        pythonCode += `def calculate_target_position(\n`;
        pythonCode += `    starting_pos_x: float,\n`;
        pythonCode += `    starting_pos_y: float,\n`;
        pythonCode += `    inches_wanted_to_move_x: float,\n`;
        pythonCode += `    inches_wanted_to_move_y: float,\n`;
        pythonCode += `    inches_per_gyro_unit: float\n`;
        pythonCode += `) -> dict:\n`;
        pythonCode += `    if inches_per_gyro_unit == 0:\n`;
        pythonCode += `        print("Error: inches_per_gyro_unit cannot be zero to avoid division by zero.")\n`;
        pythonCode += `        return {\n`;
        pythonCode += `            'target_pos_x': starting_pos_x,\n`;
        pythonCode += `            'target_pos_y': starting_pos_y,\n`;
        pythonCode += `            'change_x_gyro_units': 0,\n`;
        pythonCode += `            'change_y_gyro_units': 0\n`;
        pythonCode += `        }\n`;
        pythonCode += `    change_x_gyro_units = inches_wanted_to_move_x / inches_per_gyro_unit\n`;
        pythonCode += `    change_y_gyro_units = inches_wanted_to_move_y / inches_per_gyro_unit\n`;
        pythonCode += `    target_pos_x = starting_pos_x + inches_wanted_to_move_x\n`;
        pythonCode += `    target_pos_y = starting_pos_y + inches_wanted_to_move_y\n`;
        pythonCode += `    return {\n`;
        pythonCode += `        'target_pos_x': target_pos_x,\n`;
        pythonCode += `        'target_pos_y': target_pos_y,\n`;
        pythonCode += `        'change_x_gyro_units': 0,\n`;
        pythonCode += `        'change_y_gyro_units': 0\n`;
        pythonCode += `    }\n\n`;

        pythonCode += `def calculate_desired_rotation_wheel_rotations(\n`;
        pythonCode += `    target_heading_degrees: float,\n`;
        pythonCode += `    current_angle_changed_degrees: float,\n`;
        pythonCode += `    angle_per_wheel_rotation_in_place: float,\n`;
        pythonCode += `    motor_degrees_per_wheel_rotation: int = MOTOR_DEGREES_PER_WHEEL_ROTATION\n`;
        pythonCode += `) -> float:\n`;
        pythonCode += `    if angle_per_wheel_rotation_in_place == 0:\n`;
        pythonCode += `        print("Error: angle_per_wheel_rotation_in_place cannot be zero to avoid division by zero.")\n`;
        pythonCode += `        return 0.0\n`;
        pythonCode += `    angular_difference = target_heading_degrees - current_angle_changed_degrees\n`;
        pythonCode += `    desired_wheel_rotations = angular_difference / angle_per_wheel_rotation_in_place\n`;
        pythonCode += `    return desired_wheel_rotations\n\n`;

        pythonCode += `def move_straight_inches(inches: float, speed: int = 50):\n`;
        pythonCode += `    inches_per_wheel_rotation = WHEEL_CIRCUMFERENCE / (MOTOR_DEGREES_PER_WHEEL_ROTATION / 360)\n`;
        pythonCode += `    if inches_per_wheel_rotation == 0:\n`;
        pythonCode += `        print("Error: inches_per_wheel_rotation cannot be zero.")\n`;
        pythonCode += `        return\n`;
        pythonCode += `    motor_degrees_to_run = (inches / inches_per_wheel_rotation) * MOTOR_DEGREES_PER_WHEEL_ROTATION\n`;
        pythonCode += `    print(f"Moving straight {inches:.2f} inches ({motor_degrees_to_run:.0f} motor degrees)")\n`;
        pythonCode += `    left_motor.run_for_degrees(motor_degrees_to_run, speed)\n`;
        pythonCode += `    right_motor.run_for_degrees(motor_degrees_to_run, speed)\n`;
        pythonCode += `    left_motor.wait_until_not_moving()\n`;
        pythonCode += `    right_motor.wait_until_not_moving()\n\n`;

        pythonCode += `def turn_degrees(degrees: float, speed: int = 50):\n`;
        pythonCode += `    motion_sensor.reset_yaw_angle()\n`;
        pythonCode += `    time.sleep(0.1)\n`;
        pythonCode += `    rotations_needed = calculate_desired_rotation_wheel_rotations(\n`;
        pythonCode += `        degrees,\n`;
        pythonCode += `        0.0,\n`;
        pythonCode += `        ANGLE_PER_WHEEL_ROTATION_IN_PLACE\n`;
        pythonCode += `    )\n`;
        pythonCode += `    motor_degrees_to_run = rotations_needed * MOTOR_DEGREES_PER_WHEEL_ROTATION\n`;
        pythonCode += `    print(f"Turning {degrees:.2f} degrees ({motor_degrees_to_run:.0f} motor degrees per wheel)")\n`;
        pythonCode += `    left_motor.run_for_degrees(motor_degrees_to_run, speed)\n`;
        pythonCode += `    right_motor.run_for_degrees(-motor_degrees_to_run, speed)\n`;
        pythonCode += `    left_motor.wait_until_not_moving()\n`;
        pythonCode += `    right_motor.wait_until_not_moving()\n`;
        pythonCode += `    actual_turn = motion_sensor.get_yaw_angle()\n`;
        pythonCode += `    print(f"Actual turn observed by gyro: {actual_turn:.2f} degrees")\n\n`;


        pythonCode += `print("Robot Program Initializing...")\n`;
        pythonCode += `hub.display.set_icon('HAPPY')\n`;
        pythonCode += `hub.light_matrix.show_image('HAPPY')\n`;

        commands.forEach(cmd => {
            switch (cmd.type) {
                case 'drive':
                    pythonCode += `\n# Drive command: drive(${cmd.value})\n`;
                    pythonCode += `if ${cmd.value} != 0:\n`;
                    pythonCode += `    move_straight_inches(${cmd.value}, ${currentDriveSpeed})\n`;
                    pythonCode += `else:\n`;
                    pythonCode += `    print("Drive distance is zero, skipping movement.")\n`;
                    break;
                case 'turn':
                    pythonCode += `\n# Turn command: turn(${cmd.value})\n`;
                    pythonCode += `if ${cmd.value} != 0:\n`;
                    pythonCode += `    turn_degrees(${cmd.value}, ${currentTurnSpeed})\n`;
                    pythonCode += `else:\n`;
                    pythonCode += `    print("Turn angle is zero, skipping turn.")\n`;
                    break;
                case 'wait':
                    pythonCode += `\n# Wait command: wait(${cmd.value})\n`;
                    pythonCode += `print(f"Waiting ${cmd.value} milliseconds...")\n`;
                    pythonCode += `wait_for_seconds(${cmd.value} / 1000.0)\n`;
                    break;
                case 'set_motor_power':
                    pythonCode += `\n# Set motor power command: set_motor_power('${cmd.port}', ${cmd.power})\n`;
                    pythonCode += `motor_obj = get_motor_by_port('${cmd.port}')\n`;
                    pythonCode += `if motor_obj:\n`;
                    pythonCode += `    motor_obj.start(${cmd.power})\n`;
                    pythonCode += `    print(f"Setting motor ${cmd.port} power to ${cmd.power}%.")\n`;
                    pythonCode += `else:\n`;
                    pythonCode += `    hub.display.print(f"Invalid motor port {cmd.port}")\n`;
                    break;
                case 'stop_motor':
                    pythonCode += `\n# Stop motor command: stop_motor('${cmd.port}')\n`;
                    pythonCode += `motor_obj = get_motor_by_port('${cmd.port}')\n`;
                    pythonCode += `if motor_obj:\n`;
                    pythonCode += `    motor_obj.stop()\n`;
                    pythonCode += `    print(f"Stopping motor ${cmd.port}.")\n`;
                    break;
                case 'set_drive_speed':
                    pythonCode += `\n# Set drive speed command: set_drive_speed(${cmd.value})\n`;
                    pythonCode += `print(f"Setting default drive speed to ${cmd.value}%.")\n`;
                    break;
                case 'print_message':
                    pythonCode += `\n# Display message command: display_message("${cmd.value}")\n`;
                    pythonCode += `print(f"MESSAGE: ${cmd.value}")\n`;
                    pythonCode += `hub.display.print("${cmd.value}")\n`;
                    break;
            }
        });

        pythonCode += `\nprint("Program finished.")\n`;
        pythonCode += `hub.display.set_icon('GIGGLE')\n`;
        pythonCode += `hub.light_matrix.show_image('GIGGLE')\n`;
        return pythonCode;
    }

    function setRobotState(x, y, angle) {
        cancelAnimationFrame(animationFrameId);
        simulationRunning = false;
        commandQueue = [];
        currentCommandIndex = 0;
        commandStartTime = 0;

        robotX = x;
        robotY = y;
        robotAngle = angle;
        currentDriveSpeed = 50;
        currentTurnSpeed = 50;
        for (const port in motorStates) {
            motorStates[port] = 0;
        }
        drawRobot();
        consoleOutput.innerHTML = '';
    }

    function resetSimulationExecution() {
        cancelAnimationFrame(animationFrameId);
        simulationRunning = false;
        commandQueue = [];
        currentCommandIndex = 0;
        commandStartTime = 0;
        
        consoleOutput.innerHTML = '';
        logToConsole("Simulation execution reset. Robot position maintained.");
    }

    function executeCommand(command, deltaTime) {
        if (!simulationRunning) return;

        switch (command.type) {
            case 'drive':
                const driveSpeedPerMs = (currentDriveSpeed / 100) * 0.1;
                const distanceToDrive = command.value;
                const distanceCoveredSoFar = (command.traveled || 0);
                const distanceRemainingForCommand = distanceToDrive - distanceCoveredSoFar;
                const direction = Math.sign(distanceToDrive);

                let maxMoveDistanceThisFrame = driveSpeedPerMs * deltaTime;

                // Adjust angle calculation based on robotAngle: 0=right, 90=up, 180=left, 270=down
                // Math.cos expects radians, and 0 is right, 90 is up (in counter-clockwise from x-axis).
                // Our `robotAngle` is FLL style (0=right, 90=up), so convert to standard math angle.
                const mathAngleRad = (90 - robotAngle) * Math.PI / 180; // 90-angle converts FLL angle to standard math angle (0=right, 90=up, etc.)
                const cosAngle = Math.cos(mathAngleRad);
                const sinAngle = Math.sin(mathAngleRad);

                let actualDistanceToMoveThisFrame = Math.min(maxMoveDistanceThisFrame, Math.abs(distanceRemainingForCommand));
                actualDistanceToMoveThisFrame *= direction;

                let dx = cosAngle * actualDistanceToMoveThisFrame;
                let dy = -sinAngle * actualDistanceToMoveThisFrame; // Negative because canvas Y-axis goes down

                const halfRobotWidth = ROBOT_WIDTH_INCHES / 2;
                const halfRobotHeight = ROBOT_HEIGHT_INCHES / 2;

                const minX = halfRobotWidth;
                const maxX = CANVAS_WIDTH_INCHES - halfRobotWidth;
                const minY = halfRobotHeight;
                const maxY = CANVAS_HEIGHT_INCHES - halfRobotHeight;

                let newRobotX = robotX + dx;
                let newRobotY = robotY + dy;

                let hitBoundary = false;
                let edgeHitMessages = [];

                if (newRobotX < minX) {
                    dx = minX - robotX;
                    newRobotX = minX;
                    hitBoundary = true;
                    edgeHitMessages.push('left');
                } else if (newRobotX > maxX) {
                    dx = maxX - robotX;
                    newRobotX = maxX;
                    hitBoundary = true;
                    edgeHitMessages.push('right');
                }

                if (newRobotY < minY) {
                    dy = minY - robotY;
                    newRobotY = minY;
                    hitBoundary = true;
                    edgeHitMessages.push('top');
                } else if (newRobotY > maxY) {
                    dy = maxY - robotY;
                    newRobotY = maxY;
                    hitBoundary = true;
                    edgeHitMessages.push('bottom');
                }

                robotX += dx;
                robotY += dy;

                const actualDistanceMovedInFrame = Math.sqrt(dx * dx + dy * dy);

                command.traveled = distanceCoveredSoFar + (actualDistanceMovedInFrame * direction);

                if (Math.abs(command.traveled) >= Math.abs(distanceToDrive) - 0.01 || hitBoundary) {
                    command.completed = true;
                    if (hitBoundary) {
                        logToConsole(`Error: Robot hit the ${edgeHitMessages.join(' and ')} boundary! Stopping simulation.`, 'error');
                        simulationRunning = false;
                    }
                }
                break;

            case 'turn':
                const turnDegreesPerMs = (currentTurnSpeed / 100) * 0.1;
                const degreesToTurn = command.value;
                
                let remainingDegrees = degreesToTurn - (command.turned || 0);
                let actualDegreesThisFrame = Math.min(Math.abs(remainingDegrees), turnDegreesPerMs * deltaTime);
                if (remainingDegrees < 0) {
                    actualDegreesThisFrame = -actualDegreesThisFrame;
                }

                if (Math.abs(remainingDegrees) <= 0.01) {
                    command.completed = true;
                } else {
                    command.turned = (command.turned || 0) + actualDegreesThisFrame;
                    robotAngle += actualDegreesThisFrame;
                    robotAngle = (robotAngle + 360) % 360; // Keep angle between 0 and 360

                    if (Math.abs(command.turned) >= Math.abs(degreesToTurn) - 0.01) {
                        command.completed = true;
                    }
                }
                break;

            case 'wait':
                if (!commandStartTime) {
                    commandStartTime = performance.now();
                }
                const elapsedTime = performance.now() - commandStartTime;
                if (elapsedTime >= command.value) {
                    command.completed = true;
                }
                break;

            case 'set_motor_power':
                motorStates[command.port] = command.power;
                logToConsole(`Motor ${command.port} set to ${command.power}% power.`);
                command.completed = true;
                break;
            case 'stop_motor':
                motorStates[command.port] = 0;
                logToConsole(`Motor ${command.port} stopped.`);
                command.completed = true;
                break;
            case 'set_drive_speed':
                currentDriveSpeed = command.value;
                logToConsole(`Drive speed set to ${command.value}%.`);
                command.completed = true;
                break;
            case 'print_message':
                logToConsole(command.value);
                command.completed = true;
                break;
        }
    }


    let lastUpdateTime = 0;
    function animateSimulation(currentTime) {
        if (!simulationRunning) return;

        const deltaTime = currentTime - lastUpdateTime;
        lastUpdateTime = currentTime;

        if (currentCommandIndex < commandQueue.length) {
            const command = commandQueue[currentCommandIndex];

            executeCommand(command, deltaTime);

            if (command.completed) {
                currentCommandIndex++;
                commandStartTime = 0;
                delete command.traveled;
                delete command.turned;
            }
        } else {
            simulationRunning = false;
            logToConsole("Program execution finished.");
        }

        drawRobot();
        animationFrameId = requestAnimationFrame(animateSimulation);
    }


    // --- Event Listeners ---
    runButton.addEventListener('click', () => {
        if (robotSpecs.wheelDiameter === null || robotSpecs.motorDegreesPerRotation === null ||
            robotSpecs.wheelDiameter === '' || robotSpecs.motorDegreesPerRotation === '') {
            showMessage("Please fill out all Robot Specifications before running the code.", true);
            return;
        }

        resetSimulationExecution();
        commandQueue = parseCode(codeEditor.value);

        const parsed = parseCode(codeEditor.value);
        const python = generatePython(parsed);
        pythonCodeDisplay.value = python;

        if (commandQueue.length > 0) {
            simulationRunning = true;
            lastUpdateTime = performance.now();
            animationFrameId = requestAnimationFrame(animateSimulation);
            logToConsole("Running code from current robot position...");
        } else {
            logToConsole("No commands to run.", 'warn');
        }
    });

    resetButton.addEventListener('click', () => {
        // Default start position: center of the bottom edge, facing up (270 degrees)
        setRobotState(
            CANVAS_WIDTH_INCHES / 2,
            CANVAS_HEIGHT_INCHES - (ROBOT_HEIGHT_INCHES / 2),
            90 // Changed to 90 for 'up' based on common FLL conventions (0=right, 90=up, 180=left, 270=down)
        );
        logToConsole("Robot and simulation fully reset to default start.");
    });

    copyButton.addEventListener('click', () => {
        const parsed = parseCode(codeEditor.value);
        const python = generatePython(parsed);
        pythonCodeDisplay.value = python;
        
        // Use execCommand for copying, as navigator.clipboard.writeText might not work in some contexts
        try {
            pythonCodeDisplay.select();
            document.execCommand('copy');
            showMessage('Python code copied to clipboard!');
        } catch (err) {
            showMessage('Failed to copy code. Please copy manually.', true);
            console.error('Copy failed:', err);
        }
    });

    uploadButton.addEventListener('click', () => {
        uploadModalOverlay.classList.add('show');
    });

    modalCloseButton.addEventListener('click', () => {
        uploadModalOverlay.classList.remove('show');
        pasteCodeTextarea.value = '';
    });

    modalUploadFileButton.addEventListener('click', () => {
        fileUploadInput.click();
        // Modal will close after file is processed by fileUploadInput.addEventListener 'change'
    });

    modalPasteCodeButton.addEventListener('click', () => {
        const pastedCode = pasteCodeTextarea.value;
        if (pastedCode) {
            codeEditor.value = pastedCode;
            highlightCode();
            showMessage('Code pasted successfully!');
            uploadModalOverlay.classList.remove('show');
            pasteCodeTextarea.value = '';
        } else {
            showMessage('Paste area is empty.', true);
        }
    });


    fileUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                codeEditor.value = e.target.result;
                highlightCode();
                showMessage(`File "${file.name}" loaded successfully.`);
                uploadModalOverlay.classList.remove('show'); // Close modal after upload
            };
            reader.onerror = () => {
                showMessage('Failed to read file.', true);
            };
            fileUploadInput.value = ''; // Clear file input
        }
    });

    startLeftButton.addEventListener('click', () => {
        setRobotState(
            ROBOT_WIDTH_INCHES / 2, // Left edge
            CANVAS_HEIGHT_INCHES - (ROBOT_HEIGHT_INCHES / 2), // Bottom edge
            90 // Facing up
        );
        logToConsole("Robot moved to bottom-left, facing up.");
    });

    startRightButton.addEventListener('click', () => {
        setRobotState(
            CANVAS_WIDTH_INCHES - (ROBOT_WIDTH_INCHES / 2), // Right edge
            CANVAS_HEIGHT_INCHES - (ROBOT_HEIGHT_INCHES / 2), // Bottom edge
            90 // Facing up
        );
        logToConsole("Robot moved to bottom-right, facing up.");
    });

    // --- Robot Specification Logic ---
    function loadRobotSpecs() {
        const savedSpecs = localStorage.getItem('robotSpecs');
        if (savedSpecs) {
            robotSpecs = JSON.parse(savedSpecs);
        }
        // Ensure values are set to inputs, or empty string if null
        wheelDiameterInput.value = robotSpecs.wheelDiameter !== null ? robotSpecs.wheelDiameter : '';
        motorDegreesPerRotationInput.value = robotSpecs.motorDegreesPerRotation !== null ? robotSpecs.motorDegreesPerRotation : '';
        leftMotorPortSelect.value = robotSpecs.leftMotorPort;
        rightMotorPortSelect.value = robotSpecs.rightMotorPort;
    }

    function saveRobotSpecs() {
        robotSpecs.wheelDiameter = wheelDiameterInput.value === '' ? null : parseFloat(wheelDiameterInput.value);
        robotSpecs.motorDegreesPerRotation = motorDegreesPerRotationInput.value === '' ? null : parseInt(motorDegreesPerRotationInput.value);
        robotSpecs.leftMotorPort = leftMotorPortSelect.value;
        robotSpecs.rightMotorPort = rightMotorPortSelect.value;
        localStorage.setItem('robotSpecs', JSON.stringify(robotSpecs));
        showMessage('Robot specifications saved!');
    }

    wheelDiameterInput.addEventListener('change', saveRobotSpecs);
    motorDegreesPerRotationInput.addEventListener('change', saveRobotSpecs);
    leftMotorPortSelect.addEventListener('change', saveRobotSpecs);
    rightMotorPortSelect.addEventListener('change', saveRobotSpecs);

    // Initial setup
    setRobotState(
        CANVAS_WIDTH_INCHES / 2,
        CANVAS_HEIGHT_INCHES - (ROBOT_HEIGHT_INCHES / 2),
        90 // Default robot starts facing up
    );
    loadRobotSpecs();

    // Event listener for window resize to adjust canvas size
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial canvas resize
});
