import { encodePlantUML } from './netlify/mcp-server/tools/plantuml-encoder.ts';

// Test what URL our current implementation generates
const simpleTest = "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml";

const encoded = encodePlantUML(simpleTest);
const currentUrl = `https://uml.planttext.com/plantuml/svg/${encoded}`;
const officialUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;

console.log('Current implementation URL:', currentUrl);
console.log('Official PlantUML URL:', officialUrl);
console.log('Encoded string:', encoded);

// Test both endpoints
console.log('\n=== TESTING ENDPOINTS ===');

try {
  const response1 = await fetch(currentUrl, { method: 'HEAD' });
  console.log('Current endpoint status:', response1.status);
  console.log('Current endpoint headers:', Object.fromEntries(response1.headers.entries()));
} catch (error) {
  console.log('Current endpoint error:', error.message);
}

try {
  const response2 = await fetch(officialUrl, { method: 'HEAD' });
  console.log('Official endpoint status:', response2.status);
  console.log('Official endpoint headers:', Object.fromEntries(response2.headers.entries()));
} catch (error) {
  console.log('Official endpoint error:', error.message);
}