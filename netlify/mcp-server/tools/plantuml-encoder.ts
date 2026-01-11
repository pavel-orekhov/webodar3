import * as zlib from 'zlib';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// Константы алфавитов - точно как в исходном коде
const PLANTUML_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Функция encodePlantUML - точно как в исходном коде
export function encodePlantUML(plantumlCode: string): string {
  const deflated = zlib.deflateRawSync(Buffer.from(plantumlCode, 'utf8'), { level: 9 });
  const base64 = deflated.toString('base64');
  
  let encoded = '';
  for (let i = 0; i < base64.length; i++) {
    const char = base64[i];
    const index = BASE64_ALPHABET.indexOf(char);
    if (index !== -1) {
      encoded += PLANTUML_ALPHABET[index];
    }
  }
  
  return encoded;
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