import express, { type Request, type Response } from "express";
import serverless from "serverless-http";

const app = express();

app.get("/env", (req: Request, res: Response) => {
  const env: Record<string, string> = {};
  
  Object.keys(process.env).forEach(key => {
    const value = process.env[key] || "";
    if (value.length <= 4) {
      env[key] = "?".repeat(value.length);
    } else {
      env[key] = "?".repeat(value.length - 4) + value.slice(-4);
    }
  });
  
  res.json(env);
});

export const handler = serverless(app);
