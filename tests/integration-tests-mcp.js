#!/usr/bin/env node

// Integration Tests for PlantUML Encoder MCP Server
// This script tests the MCP server as a real MCP client would,
// using HTTP requests to verify end-to-end functionality.

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const MCP_URL = 'http://localhost:8888/mcp';

// Load test data
const testDataPath = join(process.cwd(), 'tests', 'test_data.json');
const testData = JSON.parse(readFileSync(testDataPath, 'utf8'));

async function makeMCPRequest(method, params = {}, id = Date.now()) {
  const response = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      method,
      params
    })
  });
  
  const text = await response.text();
  
  // Extract JSON from SSE format
  const jsonMatch = text.match(/data: (.+)/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1]);
  }
  return JSON.parse(text);
}

async function startServer() {
  console.log('1. Starting netlify development server...');
  
  const server = spawn('netlify', ['dev', '--port=8888'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  let serverOutput = '';
  
  server.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });
  
  server.stderr.on('data', (data) => {
    serverOutput += data.toString();
  });
  
  // Wait for server to start
  console.log('2. Waiting for server startup...');
  for (let i = 1; i <= 30; i++) {
    try {
      const response = await fetch('http://localhost:8888');
      if (response.ok) {
        console.log('   ✅ Server started successfully');
        return server;
      }
    } catch (error) {
      // Server not ready yet
    }
    
    console.log(`   ⏳ Waiting... (${i}/30)`);
    await sleep(1000);
  }
  
  console.log('❌ Error: Server failed to start');
  console.log('Server output:', serverOutput);
  process.exit(1);
}

async function runTests() {
  const server = await startServer();
  
  try {
    console.log('3. Testing MCP tools list...');
    
    const listResponse = await makeMCPRequest('tools/list');
    console.log('   Response from tools/list:');
    console.log(JSON.stringify(listResponse, null, 2));
    
    const tools = listResponse.result.tools || [];
    const hasPlantUMLTool = tools.some(tool => tool.name === 'encode-plantuml');
    
    if (hasPlantUMLTool) {
      console.log('   ✅ Tool \'encode-plantuml\' found in list');
    } else {
      console.log('   ❌ Tool \'encode-plantuml\' NOT found in list');
      process.exit(1);
    }
    
    console.log('4. Testing MCP tool with acceptance tests...');
    
    let acceptancePassed = 0;
    let testNum = 0;
    
    for (const testCase of testData.acceptance_tests) {
      testNum++;
      console.log(`   Test ${testNum}/5: ${testCase.name}...`);
      
      const callResponse = await makeMCPRequest('tools/call', {
        name: 'encode-plantuml',
        arguments: {
          plantumlCode: testCase.code
        }
      });
      
      const content = callResponse.result?.content?.[0]?.text;
      if (content) {
        const result = JSON.parse(content);
        if (result.encoded === testCase.expected) {
          console.log(`      ✅ ${testCase.name}: PASS`);
          acceptancePassed++;
        } else {
          console.log(`      ❌ ${testCase.name}: FAIL`);
          console.log(`         Expected: ${testCase.expected}`);
          console.log(`         Got:      ${result.encoded}`);
        }
      } else {
        console.log(`      ❌ ${testCase.name}: FAIL - No content in response`);
      }
    }
    
    console.log('5. Testing MCP tool with validation tests...');
    
    let validationPassed = 0;
    testNum = 0;
    
    for (const testCase of testData.validation_tests) {
      testNum++;
      console.log(`   Test ${testNum}/3: ${testCase.name}...`);
      
      let inputCode = testCase.code;
      
      // Handle special cases
      if (testCase.name === 'Large code') {
        inputCode = 'a'.repeat(50 * 1024 + 1);
      }
      
      try {
        const callResponse = await makeMCPRequest('tools/call', {
          name: 'encode-plantuml',
          arguments: {
            plantumlCode: inputCode
          }
        });
        
        const content = callResponse.result?.content?.[0]?.text;
        if (content) {
          const result = JSON.parse(content);
          if (result.code === testCase.expected_error) {
            console.log(`      ✅ ${testCase.name}: PASS`);
            validationPassed++;
          } else {
            console.log(`      ❌ ${testCase.name}: FAIL`);
            console.log(`         Expected error: ${testCase.expected_error}`);
            console.log(`         Got error: ${result.code}`);
          }
        } else {
          console.log(`      ❌ ${testCase.name}: FAIL - No content in response`);
        }
      } catch (error) {
        console.log(`      ❌ ${testCase.name}: FAIL - ${error.message}`);
      }
    }
    
    console.log('6. Stopping server...');
    server.kill();
    
    // Итоговый отчет
    console.log('');
    console.log('=== FINAL REPORT ===');
    console.log(`Acceptance Tests: ${acceptancePassed}/5 passed`);
    console.log(`Validation Tests: ${validationPassed}/3 passed`);
    
    if (acceptancePassed === 5 && validationPassed === 3) {
      console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
      console.log('');
      console.log('MCP Server integration verified:');
      console.log('  - Tools list correctly shows \'encode-plantuml\'');
      console.log('  - All acceptance tests produce expected encoded values');
      console.log('  - Validation errors are properly handled');
      console.log('  - HTTP/SSE protocol communication works correctly');
    } else {
      console.log('❌ SOME TESTS FAILED');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Test error:', error);
    server.kill();
    process.exit(1);
  }
}

runTests();