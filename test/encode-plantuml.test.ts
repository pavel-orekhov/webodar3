import assert from 'assert';
import { encodePlantUML, validatePlantUMLCode } from '../netlify/mcp-server/tools/plantuml-encoder.js';

// Test cases из требований
const testCases = [
  {
    code: "@startuml\nA -> B\n@enduml",
    expected: "SrJGjLDm0W00",
    name: "Test 1"
  },
  {
    code: "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
    expected: "Syp9J4vLqBLJSCfFibBmICt9oUS2Ca4YZY0fe5Wc0000",
    name: "Test 2"
  },
  {
    code: "@startuml\n[*] --> State1\nState1 --> State2\n@enduml",
    expected: "YzQALT3LjLC8BaaiIJNaWb084IC0",
    name: "Test 3"
  },
  {
    code: "@startuml\nclass User {\n    name: String\n  email: String\n}\n@enduml",
    expected: "Iyv9B2vM22rEBLAevb80Whp4t5GhXU2IeioyTA10QcvYPWwSNmi0",
    name: "Test 4"
  },
  {
    code: "@startuml\nstart\n:action;\nstop\n@enduml",
    expected: "Aov9B2hXiafCBidCpxFcAYx9Bm00",
    name: "Test 5"
  }
];

// Acceptance tests - обязательные 5 тестов
console.log('=== ACCEPTANCE TESTS ===');
for (const testCase of testCases) {
  try {
    const result = encodePlantUML(testCase.code);
    assert.strictEqual(result, testCase.expected, `${testCase.name}: Expected "${testCase.expected}", got "${result}"`);
    console.log(`✅ ${testCase.name}: PASS`);
  } catch (error) {
    console.log(`❌ ${testCase.name}: FAIL`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${error instanceof Error ? (error as any).actual : 'undefined'}"`);
    throw error;
  }
}

// Дополнительные тесты
console.log('\n=== VALIDATION TESTS ===');

// Test empty string
const emptyResult = validatePlantUMLCode("");
assert.strictEqual(emptyResult.valid, false);
assert.strictEqual(emptyResult.code, "EMPTY_CODE");
console.log("✅ Empty string validation: PASS");

// Test null
const nullResult = validatePlantUMLCode(null as any);
assert.strictEqual(nullResult.valid, false);
assert.strictEqual(nullResult.code, "EMPTY_CODE");
console.log("✅ Null validation: PASS");

// Test undefined
const undefinedResult = validatePlantUMLCode(undefined as any);
assert.strictEqual(undefinedResult.valid, false);
assert.strictEqual(undefinedResult.code, "EMPTY_CODE");
console.log("✅ Undefined validation: PASS");

// Test whitespace-only
const whitespaceResult = validatePlantUMLCode("   \n\t  ");
assert.strictEqual(whitespaceResult.valid, false);
assert.strictEqual(whitespaceResult.code, "EMPTY_CODE");
console.log("✅ Whitespace-only validation: PASS");

// Test code > 50KB
const largeCode = "a".repeat(50 * 1024 + 1);
const largeResult = validatePlantUMLCode(largeCode);
assert.strictEqual(largeResult.valid, false);
assert.strictEqual(largeResult.code, "CODE_TOO_LARGE");
console.log("✅ Large code validation: PASS");

// Test exactly 50KB (should pass)
const exactCode = "a".repeat(50 * 1024);
const exactResult = validatePlantUMLCode(exactCode);
assert.strictEqual(exactResult.valid, true);
console.log("✅ Exactly 50KB validation: PASS");

// Test determinism
const simpleCode = "@startuml\nA -> B\n@enduml";
const result1 = encodePlantUML(simpleCode);
const result2 = encodePlantUML(simpleCode);
assert.strictEqual(result1, result2);
console.log("✅ Determinism test: PASS");

console.log('\n=== ALL TESTS PASSED ===');