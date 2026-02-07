import express, { type Request, type Response } from "express";
import serverless from "serverless-http";
import { getBlobsStore } from "../lib/blobs.js";
import { encodePlantUML } from "../mcp-server/tools/plantuml-encoder.js";

const app = express();
app.use(express.json());

const BLOBS_STORE_NAME = "diagrams";

app.get("/diagrams", async (req: Request, res: Response) => {
  try {
    const store = getBlobsStore({ name: BLOBS_STORE_NAME });
    const id = req.query.id as string;

    if (id) {
      const diagram = await store.getJSON(`diagram:${id}`);
      if (!diagram) {
        return res.status(404).json({
          status: "error",
          code: "NOT_FOUND",
          message: `Diagram with id '${id}' not found`
        });
      }
      const encoded = encodePlantUML(diagram.plantumlCode);
      const svgUrl = `https://uml.planttext.com/plantuml/svg/${encoded}`;
      return res.json({ ...diagram, svgUrl });
    }

    let allBlobs: any[] = [];
    let cursor: string | undefined;
    do {
      const result: any = await store.list({ prefix: "diagram:", cursor });
      allBlobs.push(...result.blobs);
      cursor = result.cursor;
    } while (cursor);

    const diagrams = await Promise.all(
      allBlobs.map(async (b) => {
        try {
          return await store.getJSON(b.key);
        } catch (e) {
          console.error(`Error loading blob ${b.key}:`, e);
          return null;
        }
      })
    );
    
    const validDiagrams = diagrams
      .filter((d): d is any => d !== null)
      .map(d => ({
        id: d.id,
        label: d.label,
        timestamp: d.timestamp
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ diagrams: validDiagrams });
  } catch (error: any) {
    let errorData;
    try {
      errorData = JSON.parse(error.message);
    } catch {
      errorData = { 
        message: error.message,
        code: "INTERNAL_ERROR"
      };
    }
    res.status(500).json({
      status: "error",
      ...errorData
    });
  }
});

export const handler = serverless(app);
