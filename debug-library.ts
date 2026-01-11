import plantumlEncoder from 'plantuml-encoder';

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

console.log("=== ТЕСТ С БИБЛИОТЕКОЙ plantuml-encoder ===");
for (const testCase of testCases) {
  try {
    const encoded = plantumlEncoder.encode(testCase.code);
    console.log(`${testCase.name}:`);
    console.log(`  Input: "${testCase.code}"`);
    console.log(`  Got: "${encoded}"`);
    console.log(`  Expected: "${testCase.expected}"`);
    console.log(`  Match: ${encoded === testCase.expected}`);
    console.log();
  } catch (error) {
    console.log(`${testCase.name}: ERROR - ${error}`);
  }
}