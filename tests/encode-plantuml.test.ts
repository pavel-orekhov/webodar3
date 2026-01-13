import assert from 'assert';
import { encodePlantUML, validatePlantUMLCode } from '../netlify/mcp-server/tools/plantuml-encoder.js';
import fs from 'fs';
import path from 'path';

// Load test data
const testDataPath = path.join(process.cwd(), 'tests', 'test_data.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

// Acceptance tests - обязательные 5 тестов
console.log('=== ACCEPTANCE TESTS ===');
for (const testCase of testData.acceptance_tests) {
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

// Validation tests
console.log('\n=== VALIDATION TESTS ===');
for (const testCase of testData.validation_tests) {
  let input = testCase.code;
  if (testCase.name === "Large code") {
    input = "a".repeat(50 * 1024 + 1);
  }
  
  let result;
  if (testCase.name === "Null") {
    result = validatePlantUMLCode(null as any);
  } else if (testCase.name === "Undefined") {
    result = validatePlantUMLCode(undefined as any);
  } else {
    result = validatePlantUMLCode(input);
  }
  
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.code, testCase.expected_error);
  console.log(`✅ ${testCase.name}: PASS`);
}

// Additional tests
console.log('\n=== ADDITIONAL TESTS ===');

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