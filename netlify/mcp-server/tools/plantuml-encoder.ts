import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import * as zlib from "zlib";

/**
 * Encodes PlantUML code using deflate + custom base64-like alphabet.
 */
export function encodePlantUML(text: string): string {
  try {
    const buffer = Buffer.from(text, "utf8");
    const deflated = zlib.deflateSync(buffer, { level: 9 });
    return encode64(deflated);
  } catch (error) {
    console.error("Encoding failed:", error);
    throw new Error("ENCODING_FAILED");
  }
}

function encode64(data: Buffer): string {
  let r = "";
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 < data.length) {
      r += append3bytes(data[i], data[i + 1], data[i + 2]);
    } else if (i + 1 < data.length) {
      r += append3bytes(data[i], data[i + 1], 0);
    } else {
      r += append3bytes(data[i], 0, 0);
    }
  }
  return r;
}

function append3bytes(b1: number, b2: number, b3: number): string {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;
  let r = "";
  r += encode6bit(c1 & 0x3f);
  r += encode6bit(c2 & 0x3f);
  r += encode6bit(c3 & 0x3f);
  r += encode6bit(c4 & 0x3f);
  return r;
}

function encode6bit(b: number): string {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return "-";
  if (b === 1) return "_";
  return "?";
}

/**
 * Validates PlantUML code.
 */
export function validatePlantUMLCode(code: string): void {
  if (!code || code.trim().length === 0) {
    console.error("Validation failed: EMPTY_CODE");
    throw new Error("EMPTY_CODE");
  }
  if (Buffer.byteLength(code, "utf8") > 50 * 1024) {
    console.error("Validation failed: CODE_TOO_LARGE");
    throw new Error("CODE_TOO_LARGE");
  }
}

/**
 * Registers the PlantUML encoder tool in the MCP server.
 */
export function registerPlantUMLEncoderTool(server: McpServer) {
  server.tool(
    "encode-plantuml",
    "Encodes PlantUML diagrams into a URL-friendly format and returns a link to the diagram",
    {
      plantumlCode: z.string().describe("The PlantUML diagram code to encode"),
    },
    async ({ plantumlCode }): Promise<CallToolResult> => {
      try {
        validatePlantUMLCode(plantumlCode);
        const encoded = encodePlantUML(plantumlCode);
        const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "success",
                url,
                encoded,
                format: "svg",
              }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        const errorMessage = error.message || "INTERNAL_ERROR";
        // Error logging is already done in validate/encode functions or here
        if (errorMessage === "INTERNAL_ERROR") {
            console.error("Unexpected error in encode-plantuml tool:", error);
        }
        
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "error",
                error: errorMessage,
              }, null, 2),
            },
          ],
        };
      }
    }
  );
}
