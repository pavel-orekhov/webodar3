import * as zlib from 'zlib';

// Тестирую разные комбинации алфавитов
const testCode = "@startuml\nA -> B\n@enduml";

console.log("=== ТЕСТ 1: Обычный порядок ===");
try {
  const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
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

console.log("\n=== ТЕСТ 2: Обратный порядок BASE64 ===");
try {
  const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  const deflated = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[BASE64_ALPHABET.length - 1 - index];
    }
  }
  console.log("Result:", encoded);
  console.log("Expected:", "SrJGjLDm0W00");
  console.log("Match:", encoded === "SrJGjLDm0W00");
} catch (e) {
  console.log("Error:", e);
}

console.log("\n=== ТЕСТ 3: Сдвиг алфавита ===");
try {
  const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  const deflated = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      const shiftedIndex = (index + 1) % PLANTUML_ALPHABET.length;
      encoded += PLANTUML_ALPHABET[shiftedIndex];
    }
  }
  console.log("Result:", encoded);
  console.log("Expected:", "SrJGjLDm0W00");
  console.log("Match:", encoded === "SrJGjLDm0W00");
} catch (e) {
  console.log("Error:", e);
}

// Анализирую промежуточные результаты
console.log("\n=== АНАЛИЗ ===");
try {
  const deflated = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  console.log("Input:", testCode);
  console.log("Input length:", testCode.length);
  console.log("Deflated length:", deflated.length);
  console.log("Base64:", base64);
  console.log("Base64 length:", base64.length);
  
  // Разбираю base64 символы
  for (let i = 0; i < Math.min(15, base64.length); i++) {
    const char = base64[i];
    const index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.indexOf(char);
    console.log(`Base64[${i}]='${char}' -> index ${index} -> PlantUML[${index}]='${'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'[index]}'`);
  }
} catch (e) {
  console.log("Error:", e);
}