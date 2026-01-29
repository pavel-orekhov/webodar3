import { encodePlantUML } from './netlify/mcp-server/tools/plantuml-encoder.ts';
import fs from 'fs';

// Load test data
const testData = JSON.parse(fs.readFileSync('./tests/plantuml-test-cases.json', 'utf8'));

console.log('=== TESTING CURRENT IMPLEMENTATION ===\n');

for (const testCase of testData.test_cases) {
  try {
    const result = encodePlantUML(testCase.input);
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