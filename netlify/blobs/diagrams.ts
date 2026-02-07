import { getStore, Store } from '@netlify/blobs';

export interface BlobsOptions {
  siteID?: string;
  token?: string;
}

export interface MissingBlobsEnvironmentError {
  code: 'MISSING_BLOBS_ENVIRONMENT';
  message: string;
  details: {
    siteID: {
      present: boolean;
      source?: 'explicit' | 'env';
      envKey?: string;
    };
    token: {
      present: boolean;
      source?: 'explicit' | 'env';
      envKey?: string;
    };
    guidance: string[];
  };
}

let cachedStore: Store | null = null;
let cachedOptions: BlobsOptions | null = null;

export function getDiagramsStore(options?: BlobsOptions): Store {
  const siteIDExplicit = options?.siteID;
  const tokenExplicit = options?.token;

  const siteIDEnv = process.env.NETLIFY_SITE_ID;
  const tokenEnv = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN;

  const siteID = siteIDExplicit || siteIDEnv;
  const token = tokenExplicit || tokenEnv;

  if (!siteID || !token) {
    const error: MissingBlobsEnvironmentError = {
      code: 'MISSING_BLOBS_ENVIRONMENT',
      message: 'Netlify Blobs configuration is incomplete. Missing required environment variables or explicit options.',
      details: {
        siteID: {
          present: !!siteID,
          source: siteIDExplicit ? 'explicit' : (siteIDEnv ? 'env' : undefined),
          envKey: siteIDEnv ? 'NETLIFY_SITE_ID' : undefined,
        },
        token: {
          present: !!token,
          source: tokenExplicit ? 'explicit' : (tokenEnv ? 'env' : undefined),
          envKey: tokenEnv ? (process.env.NETLIFY_BLOBS_TOKEN ? 'NETLIFY_BLOBS_TOKEN' : 'NETLIFY_AUTH_TOKEN') : undefined,
        },
        guidance: [
          !siteID ? 'Set NETLIFY_SITE_ID environment variable or pass siteID option' : '',
          !token ? 'Set NETLIFY_BLOBS_TOKEN or NETLIFY_AUTH_TOKEN environment variable or pass token option' : '',
          'For local development: netlify dev automatically provides these variables',
          'For production: these are automatically set in Netlify Functions',
          'For explicit configuration: call getDiagramsStore({ siteID, token })',
        ].filter(Boolean),
      },
    };
    throw error;
  }

  if (cachedStore && cachedOptions?.siteID === siteID && cachedOptions?.token === token) {
    return cachedStore;
  }

  cachedStore = getStore({
    name: 'diagrams',
    siteID,
    token,
  });

  cachedOptions = { siteID, token };

  return cachedStore;
}

export function clearStoreCache(): void {
  cachedStore = null;
  cachedOptions = null;
}
