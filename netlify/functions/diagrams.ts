import type { Context } from '@netlify/functions';
import { getDiagramsStore, MissingBlobsEnvironmentError } from '../blobs/diagrams.js';

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const method = req.method;

  try {
    const store = getDiagramsStore();

    if (method === 'GET') {
      const label = url.searchParams.get('label');

      if (label) {
        const data = await store.get(label, { type: 'text' });
        if (!data) {
          return new Response(
            JSON.stringify({
              status: 'error',
              code: 'NOT_FOUND',
              message: `Diagram with label '${label}' not found`,
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const diagram = JSON.parse(data);
        return new Response(JSON.stringify({ status: 'success', diagram }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { blobs } = await store.list();
      const diagrams = await Promise.all(
        blobs.map(async (blob) => {
          const data = await store.get(blob.key, { type: 'text' });
          return data ? JSON.parse(data) : null;
        })
      );

      return new Response(
        JSON.stringify({
          status: 'success',
          diagrams: diagrams.filter(Boolean),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (method === 'POST') {
      const body = await req.json();
      const { label, plantumlCode, url: diagramUrl } = body;

      if (!label || !plantumlCode) {
        return new Response(
          JSON.stringify({
            status: 'error',
            code: 'INVALID_REQUEST',
            message: 'label and plantumlCode are required',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const diagramData = {
        label,
        plantumlCode,
        url: diagramUrl || null,
        createdAt: new Date().toISOString(),
      };

      await store.set(label, JSON.stringify(diagramData));

      return new Response(
        JSON.stringify({
          status: 'success',
          message: `Diagram '${label}' stored successfully`,
          label,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (method === 'DELETE') {
      const label = url.searchParams.get('label');

      if (!label) {
        return new Response(
          JSON.stringify({
            status: 'error',
            code: 'INVALID_REQUEST',
            message: 'label parameter is required',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      await store.delete(label);

      return new Response(
        JSON.stringify({
          status: 'success',
          message: `Diagram '${label}' deleted successfully`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'error',
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const blobsError = error as MissingBlobsEnvironmentError;
      if (blobsError.code === 'MISSING_BLOBS_ENVIRONMENT') {
        return new Response(
          JSON.stringify({
            status: 'error',
            code: blobsError.code,
            message: blobsError.message,
            details: blobsError.details,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    console.error('Diagrams function error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
