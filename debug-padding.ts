import * as zlib from 'zlib';

const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const testCode = "A -> B";

// Текущий метод
console.log("=== ТЕКУЩИЙ МЕТОД ===");
const deflated1 = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
const base64_1 = deflated1.toString('base64');
console.log("Base64:", base64_1);
console.log("Base64 length:", base64_1.length);

// Анализирую base64 символы
let encoded1 = '';
for (let i = 0; i < base64_1.length; i++) {
  const char = base64_1[i];
  const index = BASE64_ALPHABET.indexOf(char);
  if (index !== -1) {
    encoded1 += PLANTUML_ALPHABET[index];
  }
}
console.log("Encoded:", encoded1);
console.log("Expected:", "SrJGjLDm0W00");

// Попробую добавить паддинг base64
console.log("\n=== С ПАДДИНГОМ BASE64 ===");
const deflated2 = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
const base64_2 = deflated2.toString('base64');

// Добавляю паддинг до кратности 4
let paddedBase64 = base64_2;
while (paddedBase64.length % 4 !== 0) {
  paddedBase64 += '=';
}
console.log("Padded Base64:", paddedBase64);

let encoded2 = '';
for (let i = 0; i < paddedBase64.length; i++) {
  const char = paddedBase64[i];
  const index = BASE64_ALPHABET.indexOf(char);
  if (index !== -1) {
    encoded2 += PLANTUML_ALPHABET[index];
  }
}
console.log("Encoded with padding:", encoded2);
console.log("Expected:", "SrJGjLDm0W00");

// Попробую без паддинга, но с дополнением нулями
console.log("\n=== С ДОПОЛНЕНИЕМ НУЛЯМИ ===");
const deflated3 = zlib.deflateRawSync(Buffer.from(testCode, 'utf8'), { level: 9 });
const base64_3 = deflated3.toString('base64');

let encoded3 = '';
for (let i = 0; i < base64_3.length; i++) {
  const char = base64_3[i];
  const index = BASE64_ALPHABET.indexOf(char);
  if (index !== -1) {
    encoded3 += PLANTUML_ALPHABET[index];
  }
}
// Дополняю нулями до нужной длины
while (encoded3.length < 12) {
  encoded3 += '0';
}
console.log("Encoded with zero padding:", encoded3);
console.log("Expected:", "SrJGjLDm0W00");

// Попробую использовать оригинальный код с @startuml и @enduml
console.log("\n=== С @startuml и @enduml ===");
const testCodeFull = "@startuml\nA -> B\n@enduml";
const deflated4 = zlib.deflateRawSync(Buffer.from(testCodeFull, 'utf8'), { level: 9 });
const base64_4 = deflated4.toString('base64');

let encoded4 = '';
for (let i = 0; i < base64_4.length; i++) {
  const char = base64_4[i];
  const index = BASE64_ALPHABET.indexOf(char);
  if (index !== -1) {
    encoded4 += PLANTUML_ALPHABET[index];
  }
}
console.log("Full code encoded:", encoded4);
console.log("Expected:", "SrJGjLDm0W00");