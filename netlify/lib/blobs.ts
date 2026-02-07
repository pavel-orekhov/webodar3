import { getStore, type Store } from "@netlify/blobs";

export interface BlobsConfig {
  siteID?: string;
  token?: string;
  name: string;
}

let store: Store | null = null;

/**
 * Gets a Netlify Blobs store instance.
 * Supports both env-based config and explicit {siteID, token} options.
 * Uses lazy initialization.
 */
export function getBlobsStore(config: BlobsConfig): Store {
  if (store) return store;

  const siteID = config.siteID || process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = config.token || process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_TOKEN;

  // In Netlify environment, getStore() can work without siteID/token if they are in the environment.
  // But the requirement asks for explicit check and detailed errors.
  
  if (!siteID || !token) {
    // If we're on Netlify, we might not need them explicitly, but let's check what's available
    const missing = [];
    if (!siteID) missing.push("siteID (NETLIFY_SITE_ID or SITE_ID)");
    if (!token) missing.push("token (NETLIFY_AUTH_TOKEN or NETLIFY_TOKEN)");

    // We only throw if we are not in a production Netlify environment where it might work automatically.
    // However, the requirement says "maximally detailed structured errors when missing", 
    // implying we should probably always check if we want to support the "explicit" part.
    
    throw new Error(JSON.stringify({
      status: "error",
      code: "BLOBS_CONFIG_MISSING",
      message: `Missing Netlify Blobs configuration: ${missing.join(", ")}`,
      details: {
        hasSiteID: !!siteID,
        hasToken: !!token,
        name: config.name
      }
    }));
  }

  store = getStore({
    siteID,
    token,
    name: config.name,
  });

  return store;
}
