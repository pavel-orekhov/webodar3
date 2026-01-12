#!/bin/bash

# Полный скрипт тестирования MCP сервера
set -e

echo "=== ПОЛНОЕ ТЕСТИРОВАНИЕ MCP СЕРВЕРА ==="

# Останавливаем предыдущие процессы
pkill -f netlify 2>/dev/null || true
pkill -f express-mcp-server 2>/dev/null || true

# Запускаем сервер в фоне
echo "1. Запуск netlify dev..."
cd /home/engine/project
netlify dev --port=8888 > mcp-test-server.log 2>&1 &
SERVER_PID=$!
echo "   Сервер запущен с PID: $SERVER_PID"

# Ждем запуска сервера
echo "2. Ожидание запуска сервера..."
for i in {1..30}; do
  if curl -s -f http://localhost:8888 >/dev/null 2>&1; then
    echo "   ✅ Сервер запущен успешно"
    break
  fi
  echo "   ⏳ Ожидание... ($i/30)"
  sleep 1
done

if ! curl -s -f http://localhost:8888 >/dev/null 2>&1; then
  echo "❌ Ошибка: Сервер не запустился"
  echo "Логи сервера:"
  tail -20 mcp-test-server.log
  exit 1
fi

echo "3. Проверка списка MCP tools..."

# Тест 1: List MCP Tools
LIST_RESPONSE=$(curl -s -X POST http://localhost:8888/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }')

echo "   Ответ на list tools:"
# Извлекаем JSON из SSE потока
LIST_JSON=$(echo "$LIST_RESPONSE" | grep -o 'data: .*' | sed 's/data: //' | head -1)
echo "$LIST_JSON" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"

# Проверяем, что tool есть в списке
if echo "$LIST_JSON" | grep -q "encode-plantuml"; then
  echo "   ✅ Tool 'encode-plantuml' найден в списке"
else
  echo "   ❌ Tool 'encode-plantuml' НЕ найден в списке"
  exit 1
fi

echo "4. Тестирование MCP tool с acceptance тестами..."

# Тест 2: Call MCP Tool - Acceptance Tests
ACCEPTANCE_TESTS=(
  '{"name": "Test 1", "code": "@startuml\nA -> B\n@enduml", "expected": "SrJGjLDm0W00"}'
  '{"name": "Test 2", "code": "@startuml\nAlice -> Bob: Hello\nBob -> Alice: Hi\n@enduml", "expected": "Syp9J4vLqBLJSCfFibBmICt9oUTooay2YJY2fAmKF381"}'
  '{"name": "Test 3", "code": "@startuml\n[*] --> State1\nState1 --> State2\n@enduml", "expected": "YzQALT3LjLC8BaaiIJNaWb084IC0"}'
  '{"name": "Test 4", "code": "@startuml\nclass User {\n    name: String\n  email: String\n}\n@enduml", "expected": "Iyv9B2vM22rEBLAevb9GK538IynDjL88BYdAp4ldKb18pKtCp87pQm40"}'
  '{"name": "Test 5", "code": "@startuml\nstart\n:action;\nstop\n@enduml", "expected": "Aov9B2hXiafCBidCpxFcAYx9Bm00"}'
)

ACCEPTANCE_PASSED=0
ACCEPTANCE_TOTAL=5

for i in "${!ACCEPTANCE_TESTS[@]}"; do
  TEST_NUM=$((i + 1))
  echo "   Тест $TEST_NUM/5..."
  
  TEST_DATA=$(echo "${ACCEPTANCE_TESTS[$i]}" | jq -r '.')
  CODE=$(echo "$TEST_DATA" | jq -r '.code')
  EXPECTED=$(echo "$TEST_DATA" | jq -r '.expected')
  NAME=$(echo "$TEST_DATA" | jq -r '.name')
  
  CALL_RESPONSE=$(curl -s -X POST http://localhost:8888/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"id\": $((TEST_NUM + 10)),
      \"method\": \"tools/call\",
      \"params\": {
        \"name\": \"encode-plantuml\",
        \"arguments\": {
          \"plantumlCode\": $(echo "$CODE" | jq -R -s '.')
        }
      }
    }")
  
  # Извлекаем JSON из SSE потока
  CALL_JSON=$(echo "$CALL_RESPONSE" | grep -o 'data: .*' | sed 's/data: //' | head -1)
  
  # Извлекаем encoded результат
  ENCODED=$(echo "$CALL_JSON" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.encoded' 2>/dev/null || echo "")
  
  if [ "$ENCODED" = "$EXPECTED" ]; then
    echo "      ✅ $NAME: PASS"
    ACCEPTANCE_PASSED=$((ACCEPTANCE_PASSED + 1))
  else
    echo "      ❌ $NAME: FAIL"
    echo "         Ожидалось: $EXPECTED"
    echo "         Получено:  $ENCODED"
  fi
done

echo "5. Тестирование MCP tool с validation тестами..."

# Тест 3: Call MCP Tool - Validation Tests
VALIDATION_TESTS=(
  '{"name": "Empty string", "code": "", "expected_error": "EMPTY_CODE"}'
  '{"name": "Whitespace only", "code": "   \n\t  ", "expected_error": "EMPTY_CODE"}'
)

VALIDATION_PASSED=0
VALIDATION_TOTAL=2

for i in "${!VALIDATION_TESTS[@]}"; do
  TEST_NUM=$((i + 1))
  echo "   Тест $TEST_NUM/2..."
  
  TEST_DATA=$(echo "${VALIDATION_TESTS[$i]}" | jq -r '.')
  CODE=$(echo "$TEST_DATA" | jq -r '.code')
  EXPECTED_ERROR=$(echo "$TEST_DATA" | jq -r '.expected_error')
  NAME=$(echo "$TEST_DATA" | jq -r '.name')
  
  CALL_RESPONSE=$(curl -s -X POST http://localhost:8888/mcp \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"id\": $((TEST_NUM + 20)),
      \"method\": \"tools/call\",
      \"params\": {
        \"name\": \"encode-plantuml\",
        \"arguments\": {
          \"plantumlCode\": $(echo "$CODE" | jq -R -s '.')
        }
      }
    }")
  
  # Извлекаем JSON из SSE потока
  CALL_JSON=$(echo "$CALL_RESPONSE" | grep -o 'data: .*' | sed 's/data: //' | head -1)
  
  # Извлекаем error code
  ERROR_CODE=$(echo "$CALL_JSON" | jq -r '.result.content[0].text' 2>/dev/null | jq -r '.code' 2>/dev/null || echo "")
  
  if [ "$ERROR_CODE" = "$EXPECTED_ERROR" ]; then
    echo "      ✅ $NAME: PASS"
    VALIDATION_PASSED=$((VALIDATION_PASSED + 1))
  else
    echo "      ❌ $NAME: FAIL"
    echo "         Ожидалось ошибка: $EXPECTED_ERROR"
    echo "         Получена ошибка: $ERROR_CODE"
  fi
done

# Останавливаем сервер
echo "6. Остановка сервера..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

# Итоговый отчет
echo ""
echo "=== ИТОГОВЫЙ ОТЧЕТ ==="
echo "Acceptance Tests: $ACCEPTANCE_PASSED/$ACCEPTANCE_TOTAL passed"
echo "Validation Tests: $VALIDATION_PASSED/$VALIDATION_TOTAL passed"

if [ $ACCEPTANCE_PASSED -eq $ACCEPTANCE_TOTAL ] && [ $VALIDATION_PASSED -eq $VALIDATION_TOTAL ]; then
  echo "🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!"
  exit 0
else
  echo "❌ НЕКОТОРЫЕ ТЕСТЫ НЕ ПРОШЛИ"
  exit 1
fi