// commands.js
export const VALID_COMMANDS = [
    'drive', 'stop', 'turn', 'grab', 'release', 'wait', 'loop', 'print', 'speed'
];

// We turn the header into a function that accepts motor ports
export const generateHeader = (motorL, motorR) => `import runloop, math, motor_pair, motor, time
from hub import port
r = 22
total = 100

def speed(x):
    global velocity
    velocity = x * 110

async def drive(desired):
    circumference = 2 * r * math.pi
    rotations = desired / circumference
    degrees = int(rotations * 360)
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, degrees, 0, velocity=velocity)

async def turn(desired):
    distance = int((desired / total) * 360)
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, distance, 100)

def speed_motor(x):
    global velocity_motor
    velocity_motor = x * 110

async def turn_motor(m_port, desired):
    angle = desired / 2
    motor.run_for_degrees(m_port, angle, velocity_motor)

def wait(mili):
    time.sleep_ms(mili)

async def main():
    motor_pair.pair(motor_pair.PAIR_1, port.${motorL}, port.${motorR})`;

export const WRAPPER_FOOTER = `\n\nrunloop(main())`;

export function isValid(word) {
    const clean = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (clean === "" || !isNaN(word)) return true;
    return VALID_COMMANDS.includes(clean);
}

// Updated to accept motor ports
export function getFullCode(userCode, motorL = 'A', motorR = 'B') {
    const header = generateHeader(motorL.toUpperCase(), motorR.toUpperCase());
    const indented = userCode.split('\n').map(line => "    " + line).join('\n');
    return `${header}\n${indented}${WRAPPER_FOOTER}`;
}