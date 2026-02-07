import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { getLatestDiagramByLabel } from "../../blobs/diagrams.js";

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

export const registerGetDiagramByLabelTool = (server: McpServer): void => {
  server.tool(
    "get-diagram-by-label",
    "Fetches the latest stored diagram that matches the provided label.",
    {
      label: z.string().describe("Diagram label to fetch").min(1),
    },
    async ({ label }): Promise<CallToolResult> => {
      const trimmedLabel = label.trim();
      if (!trimmedLabel) {
        return buildErrorResult(
          "INVALID_LABEL",
          "label is required and cannot be empty"
        );
      }

      try {
        const diagram = await getLatestDiagramByLabel(trimmedLabel);
        if (!diagram) {
          return buildErrorResult(
            "NOT_FOUND",
            `No diagram found for label ${trimmedLabel}`
          );
        }

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
        console.error("Fetch diagram failed", error);
        return buildErrorResult(
          "FETCH_FAILED",
          "Failed to fetch diagram from Netlify Blobs"
        );
      }
    }
  );
};
