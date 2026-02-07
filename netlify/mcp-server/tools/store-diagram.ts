import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  createDiagramKey,
  createDiagramLabel,
  storeDiagram,
  DiagramRecord,
} from "../../blobs/diagrams.js";
import {
  encodePlantUML,
  validatePlantUMLCode,
} from "./plantuml-encoder.js";

const buildErrorResult = (code: string, message: string): CallToolResult => ({
  content: [
    {
      type: "text",
      text: JSON.stringify({
        status: "error",
        code,
        message,
      }),
    },
  ],
});

export const registerStoreDiagramTool = (server: McpServer): void => {
  server.tool(
    "store-diagram",
    "Stores a PlantUML diagram in Netlify Blobs with a generated label based on the provided topic.",
    {
      topic: z
        .string()
        .describe("Topic used to generate the diagram label")
        .min(1),
      plantumlCode: z
        .string()
        .describe("PlantUML diagram code to encode and store"),
    },
    async ({ topic, plantumlCode }): Promise<CallToolResult> => {
      const trimmedTopic = topic.trim();
      if (!trimmedTopic) {
        return buildErrorResult(
          "INVALID_TOPIC",
          "topic is required and cannot be empty"
        );
      }

      const validation = validatePlantUMLCode(plantumlCode);
      if (!validation.valid) {
        return buildErrorResult(
          validation.code ?? "INVALID_CODE",
          validation.message ?? "PlantUML code is invalid"
        );
      }

      try {
        const encoded = encodePlantUML(plantumlCode);
        const svgUrl = `https://uml.planttext.com/plantuml/svg/${encoded}`;
        const createdAt = new Date().toISOString();
        const label = createDiagramLabel(trimmedTopic);
        const key = createDiagramKey(label, createdAt);

        const diagram: DiagramRecord = {
          key,
          label,
          topic: trimmedTopic,
          plantumlCode,
          encoded,
          svgUrl,
          createdAt,
        };

        await storeDiagram(diagram);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "success",
                diagram,
              }),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to store diagram";
        if (message === "PAYLOAD_TOO_LARGE") {
          return buildErrorResult(
            "PAYLOAD_TOO_LARGE",
            "Diagram payload exceeds storage limits"
          );
        }

        console.error("Store diagram failed", error);
        return buildErrorResult(
          "STORE_FAILED",
          "Failed to store diagram in Netlify Blobs"
        );
      }
    }
  );
};
