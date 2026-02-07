import type { Handler } from "@netlify/functions";
import {
  deleteDiagram,
  listAllDiagrams,
} from "../blobs/diagrams.js";

const jsonResponse = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === "GET") {
    try {
      const diagrams = await listAllDiagrams();
      return jsonResponse(200, { diagrams });
    } catch (error) {
      console.error("Failed to list diagrams", error);
      return jsonResponse(500, {
        error: "Failed to list diagrams",
      });
    }
  }

  if (event.httpMethod === "DELETE") {
    const key = event.queryStringParameters?.key;
    if (!key) {
      return jsonResponse(400, { error: "Missing diagram key" });
    }

    try {
      await deleteDiagram(key);
      return jsonResponse(200, { status: "deleted" });
    } catch (error) {
      console.error("Failed to delete diagram", error);
      return jsonResponse(500, { error: "Failed to delete diagram" });
    }
  }

  return jsonResponse(405, { error: "Method not allowed" });
};
