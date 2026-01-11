import * as zlib from 'zlib';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import plantumlEncoder from 'plantuml-encoder';

// Константы алфавитов - точно как в исходном коде
const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Функция encodePlantUML - используем проверенную библиотеку
export function encodePlantUML(plantumlCode: string): string {
  // Обрезаем @startuml и @enduml если они есть для совместимости
  let code = plantumlCode.trim();
  if (code.startsWith('@startuml')) {
    code = code.replace(/^@startuml\n?/, '').replace(/\n?@enduml$/, '');
  }
  
  return plantumlEncoder.encode(code);
}

// Функция validatePlantUMLCode - точно как в исходном коде
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

  return { valid: true };
}

// Zod schema для валидации
const PlantUMLCodeSchema = z.string()
  .min(1, 'plantumlCode is required and cannot be empty')
  .refine(code => code.trim().length > 0, 'plantumlCode cannot be whitespace-only')
  .refine(code => Buffer.byteLength(code, 'utf8') <= 50 * 1024, 'PlantUML code exceeds maximum size of 50KB');

// Функция регистрации MCP tool
export function registerPlantUMLEncoderTool(server: McpServer): void {
  server.tool(
    "encode-plantuml",
    "Encodes PlantUML diagrams to shareable URLs",
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
        const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;

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