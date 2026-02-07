import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getDiagramsStore, MissingBlobsEnvironmentError } from '../../blobs/diagrams.js';

export function registerStoreDiagramTool(server: McpServer): void {
  server.tool(
    'store-diagram',
    'Store a PlantUML diagram in Netlify Blobs with a label',
    {
      label: z.string().describe('Label/key to identify the diagram'),
      plantumlCode: z.string().describe('PlantUML diagram code to store'),
      url: z.string().optional().describe('Optional: encoded PlantUML URL'),
    },
    async ({ label, plantumlCode, url }): Promise<CallToolResult> => {
      try {
        const store = getDiagramsStore();
        
        const diagramData = {
          label,
          plantumlCode,
          url: url || null,
          createdAt: new Date().toISOString(),
        };
        
        await store.set(label, JSON.stringify(diagramData));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                message: `Diagram '${label}' stored successfully`,
                label,
              }),
            },
          ],
        };
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
          const blobsError = error as MissingBlobsEnvironmentError;
          if (blobsError.code === 'MISSING_BLOBS_ENVIRONMENT') {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    status: 'error',
                    code: blobsError.code,
                    message: blobsError.message,
                    details: blobsError.details,
                  }),
                },
              ],
            };
          }
        }
        
        console.error('Failed to store diagram:', error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'error',
                code: 'STORAGE_FAILED',
                message: error instanceof Error ? error.message : 'Failed to store diagram',
              }),
            },
          ],
        };
      }
    }
  );
}
