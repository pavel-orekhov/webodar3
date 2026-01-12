import plantumlEncoder from 'plantuml-encoder';

const testCases = [
  {
    code: "@startuml\nA -> B\n@enduml",
    name: "Test 1"
  },
  {
    code: "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml",
    name: "Test 2"
  },
  {
    code: "@startuml\n[*] --> State1\nState1 --> State2\n@enduml",
    name: "Test 3"
  },
  {
    code: "@startuml\nclass User {\n    name: String\n  email: String\n}\n@enduml",
    name: "Test 4"
  },
  {
    code: "@startuml\nstart\n:action;\nstop\n@enduml",
    name: "Test 5"
  }
];

console.log("=== ТЕСТ С ОБЕРТКАМИ ===");
for (const testCase of testCases) {
  try {
    const encoded = plantumlEncoder.encode(testCase.code);
    console.log(`${testCase.name}:`);
    console.log(`  Input: "${testCase.code.replace(/\n/g, '\\n')}"`);
    console.log(`  Got: "${encoded}"`);
    console.log();
  } catch (error) {
    console.log(`${testCase.name}: ERROR - ${error}`);
  }
}