import * as zlib from 'zlib';

const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const testCases = [
  {
    code: "A -> B",
    expected: "SrJGjLDm0W00",
    name: "Test 1"
  },
  {
    code: "Alice -> Bob: Hello\nBob -> Alice: Hi",
    expected: "Syp9J4vLqBLJSCfFibBmICt9oUS2Ca4YZY0fe5Wc0000",
    name: "Test 2"
  },
  {
    code: "[*] --> State1\nState1 --> State2",
    expected: "YzQALT3LjLC8BaaiIJNaWb084IC0",
    name: "Test 3"
  },
  {
    code: "class User {\n    name: String\n  email: String\n}",
    expected: "Iyv9B2vM22rEBLAevb80Whp4t5GhXU2IeioyTA10QcvYPWwSNmi0",
    name: "Test 4"
  },
  {
    code: "start\n:action;\nstop",
    expected: "Aov9B2hXiafCBidCpxFcAYx9Bm00",
    name: "Test 5"
  }
];

console.log("=== АНАЛИЗ ЗАВЕРШЕНИЙ ===");
for (const testCase of testCases) {
  const deflated = zlib.deflateRawSync(Buffer.from(testCase.code, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  
  // Анализирую завершение
  const trailingZerosInExpected = testCase.expected.match(/0+$/)?.[0]?.length || 0;
  console.log(`${testCase.name}:`);
  console.log(`  Trailing zeros in expected: ${trailingZerosInExpected}`);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Current:  "${encoded}"`);
  
  // Попробую добавить нули в соответствии с ожидаемыми
  let testEncoded = encoded;
  for (let i = 0; i < trailingZerosInExpected; i++) {
    testEncoded += '0';
  }
  console.log(`  Test:     "${testEncoded}"`);
  console.log(`  Match: ${testEncoded === testCase.expected}`);
  console.log();
}