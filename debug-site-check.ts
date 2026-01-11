import plantumlEncoder from 'plantuml-encoder';

const testCases = [
  {
    code: "Alice -> Bob: Hello\nBob -> Alice: Hi",
    expected: "Syp9J4vLqBLJSCfFibBmICt9oUS2Ca4YZY0fe5Wc0000",
    name: "Test 2",
    site_url: "https://www.plantuml.com/plantuml/uml/Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381"
  },
  {
    code: "class User {\n    name: String\n  email: String\n}",
    expected: "Iyv9B2vM22rEBLAevb80Whp4t5GhXU2IeioyTA10QcvYPWwSNmi0",
    name: "Test 4",
    site_url: "https://www.plantuml.com/plantuml/uml/Iyv9B2vM22rEBLAevb9GK538IynDjL88BYdAp4ldKb18pKtCp87pQm40"
  }
];

console.log("=== ПРОВЕРКА НА ОФИЦИАЛЬНОМ САЙТЕ ===");
for (const testCase of testCases) {
  const encoded = plantumlEncoder.encode(testCase.code);
  console.log(`${testCase.name}:`);
  console.log(`  Input: "${testCase.code.replace(/\n/g, '\\n')}"`);
  console.log(`  Expected: "${testCase.expected}"`);
  console.log(`  Library:  "${encoded}"`);
  console.log(`  Site URL: ${testCase.site_url.replace(testCase.expected, encoded)}`);
  console.log(`  Match with expected: ${encoded === testCase.expected}`);
  console.log();
}