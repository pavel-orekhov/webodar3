import pako from 'pako';

function encode6bit(b) {
    if (b < 10)
        return String.fromCharCode(48 + b);
    b -= 10;
    if (b < 26)
        return String.fromCharCode(65 + b);
    b -= 26;
    if (b < 26)
        return String.fromCharCode(97 + b);
    b -= 26;
    if (b === 0)
        return '-';
    if (b === 1)
        return '_';
    return '?';
}

function append3bytes(b1, b2, b3) {
    const c1 = b1 >> 2;
    const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
    const c4 = b3 & 0x3F;
    return encode6bit(c1 & 0x3F) + encode6bit(c2 & 0x3F) + encode6bit(c3 & 0x3F) + encode6bit(c4 & 0x3F);
}

export function encodePlantUML(plantuml) {
    // Deflate the input using pako (pure JS, no Node.js zlib dependency)
    const deflated = pako.deflateRaw(plantuml, { level: 9 });
    // Encode to PlantUML's custom base64-like encoding
    let result = '';
    for (let i = 0; i < deflated.length; i += 3) {
        const b1 = deflated[i];
        const b2 = i + 1 < deflated.length ? deflated[i + 1] : 0;
        const b3 = i + 2 < deflated.length ? deflated[i + 2] : 0;
        result += append3bytes(b1, b2, b3);
    }
    return result;
}

// Test against our cases
import fs from 'fs';

const testData = JSON.parse(fs.readFileSync('./tests/plantuml-test-cases.json', 'utf8'));

console.log('=== TESTING CORRECTED PLANTUML ENCODING ===\n');

for (const testCase of testData.test_cases) {
  try {
    // Remove @startuml/@enduml if present (for consistency with current implementation)
    let code = testCase.input.trim();
    if (code.startsWith('@startuml')) {
      code = code.replace(/^@startuml\s*/, '').replace(/\s*@enduml\s*$/, '');
    }
    
    const result = encodePlantUML(code);
    const expectedEncoded = testCase.expected_url.split('/svg/')[1];
    
    console.log(`Test: ${testCase.name}`);
    console.log(`Expected: ${expectedEncoded}`);
    console.log(`Got:      ${result}`);
    console.log(`Match:    ${result === expectedEncoded ? '✅' : '❌'}`);
    console.log('');
    
  } catch (error) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Error: ${error}`);
    console.log('');
  }
}