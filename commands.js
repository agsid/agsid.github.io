// commands.js
export const VALID_COMMANDS = [
    'drive', 'stop', 'turn', 'grab', 'release', 'wait', 'loop', 'print'
];

export const WRAPPER_HEADER = `import hub from spike\n\n# code\ndef runloop():\n    while True:`;
export const WRAPPER_FOOTER = `\n\nrunloop()`;

export function isValid(word) {
    const clean = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (clean === "" || !isNaN(word)) return true;
    return VALID_COMMANDS.includes(clean);
}

// This function wraps the user code for execution
export function getFullCode(userCode) {
    // Indent user code so it fits inside the 'while True' loop
    const indented = userCode.split('\n').map(line => "        " + line).join('\n');
    return `${WRAPPER_HEADER}\n${indented}${WRAPPER_FOOTER}`;
}