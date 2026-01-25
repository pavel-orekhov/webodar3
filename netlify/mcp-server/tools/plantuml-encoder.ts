import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import plantumlEncoder from 'plantuml-encoder';

// Функция encodePlantUML - используем проверенную библиотеку
export function encodePlantUML(plantumlCode: string): string {
  // Обрезаем @startuml и @enduml если они есть для совместимости
  let code = plantumlCode.trim();
  if (code.startsWith('@startuml')) {
    code = code.replace(/^@startuml\s*/, '').replace(/\s*@enduml\s*$/, '');
  }
  
  return plantumlEncoder.encode(code);
}

/**
 * Validates PlantUML code against mandatory syntax rules.
 * 
 * Error codes:
 * - EMPTY_CODE: Code is null, undefined, or empty
 * - CODE_TOO_LARGE: Code exceeds 50KB
 * - INVALID_SYNTAX: Violates strict syntax rules
 * 
 * @param plantumlCode - The PlantUML code to validate
 * @returns Validation result
 */
export function validatePlantUMLCode(plantumlCode: string): { valid: boolean; code?: string; message?: string } {
  if (!plantumlCode || typeof plantumlCode !== 'string') {
    return { valid: false, code: 'EMPTY_CODE', message: 'plantumlCode is required and cannot be empty' };
  }

  const trimmed = plantumlCode.trim();
  if (trimmed.length === 0) {
    return { valid: false, code: 'EMPTY_CODE', message: 'plantumlCode is required and cannot be empty' };
  }

  const maxSize = 50 * 1024;
  if (Buffer.byteLength(plantumlCode, 'utf8') > maxSize) {
    return { valid: false, code: 'CODE_TOO_LARGE', message: 'PlantUML code exceeds maximum size of 50KB' };
  }

  // Rule 1: @startuml must be nameless
  if (/@startuml\S+/.test(plantumlCode)) {
    return { valid: false, code: 'INVALID_SYNTAX', message: '@startuml must be nameless - use "@startuml" only (no attached name)' };
  }
  if (/@startuml[ \t]+\S+/.test(plantumlCode)) {
    return { valid: false, code: 'INVALID_SYNTAX', message: '@startuml must be nameless - use "@startuml" only (no name after space)' };
  }

  // Rule 2: Class names must use camelCase (no hyphens)
  if (/class\s+[^\s{]*-[^\s{]*/.test(plantumlCode)) {
    return { valid: false, code: 'INVALID_SYNTAX', message: 'Class names must use camelCase with no hyphens (use "queryDocs" not "query-docs")' };
  }

  return { valid: true };
}

// Функция регистрации MCP tool
export function registerPlantUMLEncoderTool(server: McpServer): void {
  server.tool(
    "encode-plantuml",
    "Encodes PlantUML diagrams to shareable URLs for uml.planttext.com\n\nSYNTAX RULES (mandatory):\n1. @startuml must be nameless - use '@startuml' only (not '@startuml DiagramName')\n2. Class names must use camelCase with no hyphens (use 'queryDocs' not 'query-docs')\n\nError code INVALID_SYNTAX if rules violated.",
    {
      plantumlCode: z.string().describe("PlantUML diagram code to encode")
    },
    async ({ plantumlCode }): Promise<CallToolResult> => {
      try {
        // Валидация входных данных
        const validation = validatePlantUMLCode(plantumlCode);
        if (!validation.valid) {
          console.error(`Validation error: ${validation.code} - ${validation.message}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  status: "error",
                  code: validation.code,
                  message: validation.message
                })
              }
            ]
          };
        }

        // Кодирование PlantUML
        const encoded = encodePlantUML(plantumlCode);
        const url = `https://uml.planttext.com/plantuml/svg/${encoded}`;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "success",
                url: url,
                encoded: encoded,
                format: "svg"
              })
            }
          ]
        };

      } catch (error) {
        console.error(`Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "error",
                code: "ENCODING_FAILED",
                message: "Failed to encode PlantUML diagram"
              })
            }
          ]
        };
      }
    }
  );
}