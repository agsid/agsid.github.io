document.addEventListener('DOMContentLoaded', () => {
    // References
    const codeEditor = document.getElementById('code-editor');
    const pythonCodeDisplay = document.getElementById('python-code-display');
    // Python template with #paste code marker
    const pythonTemplate = `import runloop,math,motor_pair,motor,time
from hub import port
#r is the radius of the wheel. thsi is used to find the circumfrence of the wheel
r = 
#This is the angle changed when the wheels run for 1 rotation in oposite directions. This is used in the turning function
total=
def speed(x):
    global velocity
    velocity = x*110

async def drive(desired):
    circumfrence=2*r*math.pi
    rotations=desired/circumfrence
    degrees=int(rotations*360)
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, degrees, 0, velocity=velocity)

async def turn(desired):
    distance=int((desired/total)*360)
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, distance, 100)

def speed_motor(x):
    global velocity_motor
    velocity_motor = x*110

async def turn_motor(port,desired):
    angle = desired/2
    motor.run_for_degrees(port.port, angle, velocity_motor)

def wait(mili):
    time.sleep_ms(mili)

async def main():
    motor_pair.pair(motor_pair.PAIR_1, port.C, port.D)
    #paste code

runloop.run(main())
`;

    // Indent user code for Python function body
    function indentCode(code, indent = '    ') {
        return code.split('\n').map(line => indent + line).join('\n');
    }

    // Update Python code display when editor changes
    codeEditor.addEventListener('input', () => {
        const userCode = codeEditor.value.trim();
        pythonCodeDisplay.value = pythonTemplate.replace(
            '#paste code',
            indentCode(userCode)
        );
    });

    // Initial load
    pythonCodeDisplay.value = pythonTemplate.replace(
        '#paste code',
        indentCode(codeEditor.value.trim())
    );

    // Settings dropdown functionality
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsMenu = document.getElementById('settings-menu');
    settingsToggle.addEventListener('click', () => {
        settingsMenu.classList.toggle('hidden');
        settingsMenu.classList.toggle('glass-menu');
    });
    document.addEventListener('click', (e) => {
        if (!settingsDropdown.contains(e.target)) {
            settingsMenu.classList.add('hidden');
            settingsMenu.classList.remove('glass-menu');
        }
    });

    // Modal functionality (if needed, add handlers here for upload/paste)
});
