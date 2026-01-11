import * as zlib from 'zlib';

const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Различные варианты тестирования
const testCode = "@startuml\nA -> B\n@enduml";

console.log("=== ТЕСТ 1: deflateRawSync ===");
try {
  const deflated = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  console.log("Result:", encoded);
  console.log("Expected:", "SrJGjLDm0W00");
  console.log("Match:", encoded === "SrJGjLDm0W00");
} catch (e) {
  console.log("Error:", e);
}

console.log("\n=== ТЕСТ 2: deflateSync ===");
try {
  const deflated = zlib.deflateSync(Buffer.from(testCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  console.log("Result:", encoded);
  console.log("Expected:", "SrJGjLDm0W00");
  console.log("Match:", encoded === "SrJGjLDm0W00");
} catch (e) {
  console.log("Error:", e);
}

console.log("\n=== ТЕСТ 3: gzipSync ===");
try {
  const deflated = zlib.gzipSync(Buffer.from(testCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  console.log("Result:", encoded);
  console.log("Expected:", "SrJGjLDm0W00");
  console.log("Match:", encoded === "SrJGjLDm0W00");
} catch (e) {
  console.log("Error:", e);
}

console.log("\n=== ТЕСТ 4: Different compression level ===");
try {
  const deflated = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 6 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  console.log("Result:", encoded);
  console.log("Expected:", "SrJGjLDm0W00");
  console.log("Match:", encoded === "SrJGjLDm0W00");
} catch (e) {
  console.log("Error:", e);
}