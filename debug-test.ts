import * as zlib from 'zlib';

const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodePlantUML(plantumlCode: string): string {
  const deflated = zlib.deflateRawSync(Buffer.from(plantumlCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  
  return encoded;
}

// Тестовый пример 1
const test1_code = "@startuml\nA -> B\n@enduml";
console.log("Input code:", test1_code);
console.log("Expected:", "SrJGjLDm0W00");
console.log("Got:", encodePlantUML(test1_code));

// Анализ промежуточных шагов
const deflated = zlib.deflateRawSync(Buffer.from(test1_code, 'utf8'), { level: 9 });
const base64 = deflated.toString('base64');
console.log("Deflated buffer:", deflated);
console.log("Base64:", base64);
console.log("Base64 length:", base64.length);

// Пошаговое кодирование
let encoded = '';
for (let i = 0; i < Math.min(10, base64.length); i++) {
  const char = base64[i];
  const index = BASE64_ALPHABET.indexOf(char);
  console.log(`Char ${i}: '${char}' -> index ${index} -> '${PLANTUML_ALPHABET[index]}'`);
  if (index !== -1) {
    encoded += PLANTUML_ALPHABET[index];
  }
}
console.log("First 10 chars encoded:", encoded);