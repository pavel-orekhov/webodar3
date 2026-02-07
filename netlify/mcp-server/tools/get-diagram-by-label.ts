import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getDiagramsStore, MissingBlobsEnvironmentError } from '../../blobs/diagrams.js';

export function registerGetDiagramByLabelTool(server: McpServer): void {
  server.tool(
    'get-diagram-by-label',
    'Retrieve a stored PlantUML diagram by its label',
    {
      label: z.string().describe('Label/key of the diagram to retrieve'),
    },
    async ({ label }): Promise<CallToolResult> => {
      try {
        const store = getDiagramsStore();
        
        const data = await store.get(label, { type: 'text' });
        
        if (!data) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status: 'error',
                  code: 'NOT_FOUND',
                  message: `Diagram with label '${label}' not found`,
                }),
              },
            ],
          };
        }
        
        const diagram = JSON.parse(data);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'success',
                diagram,
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
        
        console.error('Failed to retrieve diagram:', error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                status: 'error',
                code: 'RETRIEVAL_FAILED',
                message: error instanceof Error ? error.message : 'Failed to retrieve diagram',
              }),
            },
          ],
        };
      }
    }
  );
}
