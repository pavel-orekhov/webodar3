import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getBlobsStore } from "../../lib/blobs.js";
import { encodePlantUML, validatePlantUMLCode } from "./plantuml-encoder.js";
import crypto from "node:crypto";

const BLOBS_STORE_NAME = "diagrams";

export function registerDiagramTools(server: McpServer) {
  server.tool(
    "save-diagram",
    "Saves a PlantUML diagram to Netlify Blobs. Collisions are acceptable, latest for a label is tracked.",
    {
      label: z.string().describe("Label for the diagram"),
      plantumlCode: z.string().describe("PlantUML code")
    },
    async ({ label, plantumlCode }) => {
      try {
        const validation = validatePlantUMLCode(plantumlCode);
        if (!validation.valid) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "error",
                code: validation.code,
                message: validation.message
              })
            }]
          };
        }

        const store = getBlobsStore({ name: BLOBS_STORE_NAME });
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const diagram = { id, label, plantumlCode, timestamp };
        
        await store.setJSON(`diagram:${id}`, diagram);
        // Also update/set the label pointer to this latest id
        await store.set(`label:${label}`, id);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ status: "success", id, label, timestamp })
          }]
        };
      } catch (error: any) {
        let errorData;
        try {
            errorData = JSON.parse(error.message);
        } catch {
            errorData = { message: error.message };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              code: "SAVE_FAILED",
              ...errorData
            })
          }]
        };
      }
    }
  );

  server.tool(
    "get-diagram-by-label",
    "Gets the latest PlantUML diagram by label",
    {
      label: z.string().describe("Label of the diagram")
    },
    async ({ label }) => {
      try {
        const store = getBlobsStore({ name: BLOBS_STORE_NAME });
        const id = await store.get(`label:${label}`);
        if (!id) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "error",
                code: "NOT_FOUND",
                message: `Diagram with label '${label}' not found`
              })
            }]
          };
        }

        const diagram = await store.getJSON(`diagram:${id}`);
        const encoded = encodePlantUML(diagram.plantumlCode);
        const url = `https://uml.planttext.com/plantuml/svg/${encoded}`;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ status: "success", ...diagram, url })
          }]
        };
      } catch (error: any) {
        let errorData;
        try {
            errorData = JSON.parse(error.message);
        } catch {
            errorData = { message: error.message };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              code: "GET_FAILED",
              ...errorData
            })
          }]
        };
      }
    }
  );

  server.tool(
    "list-diagrams",
    "Lists all saved diagrams (unlimited)",
    {},
    async () => {
      try {
        const store = getBlobsStore({ name: BLOBS_STORE_NAME });
        let allBlobs: any[] = [];
        let cursor: string | undefined;
        
        do {
          const result: any = await store.list({ prefix: "diagram:", cursor });
          allBlobs.push(...result.blobs);
          cursor = result.cursor;
        } while (cursor);
        
        const diagrams = await Promise.all(
          allBlobs.map(async (b) => {
            const diagram = await store.getJSON(b.key);
            return {
              id: diagram.id,
              label: diagram.label,
              timestamp: diagram.timestamp
            };
          })
        );

        // Sort by timestamp descending
        diagrams.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ status: "success", diagrams })
          }]
        };
      } catch (error: any) {
        let errorData;
        try {
            errorData = JSON.parse(error.message);
        } catch {
            errorData = { message: error.message };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "error",
              code: "LIST_FAILED",
              ...errorData
            })
          }]
        };
      }
    }
  );
}
