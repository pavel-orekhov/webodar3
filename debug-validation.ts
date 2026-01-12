import plantumlEncoder from 'plantuml-encoder';

// Функция encodePlantUML как в моей реализации
function encodePlantUML(plantumlCode: string): string {
  let code = plantumlCode.trim();
  if (code.startsWith('@startuml')) {
    code = code.replace(/^@startuml\s*/, '').replace(/\s*@enduml\s*$/, '');
  }
  return plantumlEncoder.encode(code);
}

const testCases = [
  {
    code: "@startuml\nA -> B\n@enduml",
    expected: "SrJGjLDm0W00",
    name: "Test 1",
    site_url: "https://www.plantuml.com/plantuml/svg/SrJGjLDm0W00"
  },
  {
    code: "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
    expected: "Syp9J4vLqBLJSCfFibBmICt9oUS2Ca4YZY0fe5Wc0000",
    library_result: "Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381",
    name: "Test 2",
    site_url_expected: "https://www.plantuml.com/plantuml/svg/Syp9J4vLqBLJSCfFibBmICt9oUS2Ca4YZY0fe5Wc0000",
    site_url_library: "https://www.plantuml.com/plantuml/svg/Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381"
  },
  {
    code: "@startuml\n[*] --> State1\nState1 --> State2\n@enduml",
    expected: "YzQALT3LjLC8BaaiIJNaWb084IC0",
    name: "Test 3",
    site_url: "https://www.plantuml.com/plantuml/svg/YzQALT3LjLC8BaaiIJNaWb084IC0"
  },
  {
    code: "@startuml\nclass User {\n    name: String\n  email: String\n}\n@enduml",
    expected: "Iyv9B2vM22rEBLAevb80Whp4t5GhXU2IeioyTA10QcvYPWwSNmi0",
    library_result: "Iyv9B2vM22rEBLAevb9GK538IynDjL88BYdAp4ldKb18pKtCp87pQm40",
    name: "Test 4",
    site_url_expected: "https://www.plantuml.com/plantuml/svg/Iyv9B2vM22rEBLAevb80Whp4t5GhXU2IeioyTA10QcvYPWwSNmi0",
    site_url_library: "https://www.plantuml.com/plantuml/svg/Iyv9B2vM22rEBLAevb9GK538IynDjL88BYdAp4ldKb18pKtCp87pQm40"
  },
  {
    code: "@startuml\nstart\n:action;\nstop\n@enduml",
    expected: "Aov9B2hXiafCBidCpxFcAYx9Bm00",
    name: "Test 5",
    site_url: "https://www.plantuml.com/plantuml/svg/Aov9B2hXiafCBidCpxFcAYx9Bm00"
  }
];

console.log("=== ВАЛИДАЦИЯ НА САЙТЕ PLANTUML ===");
for (const testCase of testCases) {
  const actual = encodePlantUML(testCase.code);
  console.log(`${testCase.name}:`);
  console.log(`  Input: "${testCase.code.replace(/\n/g, '\\n')}"`);
  console.log(`  Expected: "${testCase.expected}"`);
  if (testCase.library_result) {
    console.log(`  Library:   "${testCase.library_result}"`);
  }
  console.log(`  Actual:    "${actual}"`);
  console.log(`  Match expected: ${actual === testCase.expected}`);
  if (testCase.library_result) {
    console.log(`  Match library: ${actual === testCase.library_result}`);
  }
  console.log();
}