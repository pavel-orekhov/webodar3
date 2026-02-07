import type { Context } from '@netlify/functions';

interface EnvVariable {
  key: string;
  value: string;
  masked: string;
  isEmpty: boolean;
  isUndefined: boolean;
}

function maskValue(value: string | undefined): { masked: string; isEmpty: boolean; isUndefined: boolean } {
  if (value === undefined) {
    return { masked: '[undefined]', isEmpty: false, isUndefined: true };
  }
  
  if (value === '') {
    return { masked: '[empty]', isEmpty: true, isUndefined: false };
  }
  
  if (value.length <= 4) {
    return { masked: '????' + value, isEmpty: false, isUndefined: false };
  }
  
  const lastFour = value.slice(-4);
  const questionMarks = '?'.repeat(value.length - 4);
  return { masked: questionMarks + lastFour, isEmpty: false, isUndefined: false };
}

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        status: 'error',
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const envVars: EnvVariable[] = [];

  const allKeys = Object.keys(process.env).sort();

  for (const key of allKeys) {
    const value = process.env[key];
    const { masked, isEmpty, isUndefined } = maskValue(value);
    
    envVars.push({
      key,
      value: '[REDACTED]',
      masked,
      isEmpty,
      isUndefined,
    });
  }

  return new Response(
    JSON.stringify({
      status: 'success',
      count: envVars.length,
      env: envVars,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
};
