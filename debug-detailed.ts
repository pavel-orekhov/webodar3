import * as zlib from 'zlib';

const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Детальный анализ теста 1
const test1_code = "A -> B";
const test1_expected = "SrJGjLDm0W00";

console.log("=== ДЕТАЛЬНЫЙ АНАЛИЗ ТЕСТА 1 ===");
console.log(`Input: "${test1_code}"`);
console.log(`Expected: "${test1_expected}"`);

const deflated = zlib.deflateRawSync(Buffer.from(test1_code, 'utf8'), { level: 9 });
const base64 = deflated.toString('base64');

console.log(`Deflated buffer: ${deflated.toString('hex')} (${deflated.length} bytes)`);
console.log(`Base64: "${base64}" (${base64.length} chars)`);

// Разбираю base64 по символам
console.log("\n=== ПОШАГОВОЕ КОДИРОВАНИЕ ===");
let encoded = '';
for (let i = 0; i < base64.length; i++) {
  const char = base64[i];
  const index = BASE64_ALPHABET.indexOf(char);
  const plantChar = index !== -1 ? PLANTUML_ALPHABET[index] : '?';
  console.log(`base64[${i}]='${char}' -> index ${index} -> plantUML[${index}]='${plantChar}'`);
  if (index !== -1) {
    encoded += plantChar;
  }
}
console.log(`\nEncoded: "${encoded}" (${encoded.length} chars)`);
console.log(`Expected: "${test1_expected}" (${test1_expected.length} chars)`);
console.log(`Match: ${encoded === test1_expected}`);

// Попробую использовать deflate вместо deflateRaw
console.log("\n=== ТЕСТ С deflate (НЕ deflateRaw) ===");
const deflated2 = zlib.deflateSync(Buffer.from(test1_code, 'utf8'), { level: 9 });
const base64_2 = deflated2.toString('base64');
console.log(`Deflated2: ${deflated2.toString('hex')} (${deflated2.length} bytes)`);
console.log(`Base64_2: "${base64_2}" (${base64_2.length} chars)`);

let encoded2 = '';
for (let i = 0; i < base64_2.length; i++) {
  const char = base64_2[i];
  const index = BASE64_ALPHABET.indexOf(char);
  if (index !== -1) {
    encoded2 += PLANTUML_ALPHABET[index];
  }
}
console.log(`Encoded2: "${encoded2}"`);
console.log(`Match2: ${encoded2 === test1_expected}`);

// Тест 4 детально
console.log("\n=== ДЕТАЛЬНЫЙ АНАЛИЗ ТЕСТА 4 ===");
const test4_code = "class User {\n    name: String\n  email: String\n}";
const test4_expected = "Iyv9B2vM22rEBLAevb80Whp4t5GhXU2IeioyTA10QcvYPWwSNmi0";

const deflated4 = zlib.deflateRawSync(Buffer.from(test4_code, 'utf8'), { level: 9 });
const base64_4 = deflated4.toString('base64');

let encoded4 = '';
for (let i = 0; i < base64_4.length; i++) {
  const char = base64_4[i];
  const index = BASE64_ALPHABET.indexOf(char);
  if (index !== -1) {
    encoded4 += PLANTUML_ALPHABET[index];
  }
}

console.log(`Input length: ${test4_code.length}`);
console.log(`Deflated: ${deflated4.length} bytes`);
console.log(`Base64: ${base64_4.length} chars`);
console.log(`Encoded: ${encoded4.length} chars`);
console.log(`Expected: ${test4_expected.length} chars`);
console.log(`Match: ${encoded4 === test4_expected}`);

if (encoded4 !== test4_expected) {
  console.log("\n=== СРАВНЕНИЕ СИМВОЛОВ ===");
  const minLen = Math.min(encoded4.length, test4_expected.length);
  for (let i = 0; i < minLen; i++) {
    const encodedChar = encoded4[i];
    const expectedChar = test4_expected[i];
    if (encodedChar !== expectedChar) {
      console.log(`Position ${i}: encoded="${encodedChar}" vs expected="${expectedChar}"`);
    }
  }
  if (encoded4.length !== test4_expected.length) {
    console.log(`Length difference: encoded=${encoded4.length} vs expected=${test4_expected.length}`);
  }
}