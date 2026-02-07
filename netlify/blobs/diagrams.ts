import { getStore } from "@netlify/blobs";

export type DiagramRecord = {
  key: string;
  label: string;
  topic: string;
  plantumlCode: string;
  encoded: string;
  svgUrl: string;
  createdAt: string;
};

const store = getStore("diagrams");
const maxDiagramBytes = 256 * 1024;

const normalizeTopic = (topic: string): string => {
  const trimmed = topic.trim().toLowerCase();
  const slug = trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "diagram";
};

export const createDiagramLabel = (topic: string): string => {
  const base = normalizeTopic(topic);
  const suffix = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${base}-${suffix}`;
};

export const createDiagramKey = (label: string, createdAt: string): string => {
  const safeTimestamp = createdAt.replace(/[:.]/g, "-");
  return `${label}/${safeTimestamp}`;
};

const ensurePayloadSize = (payload: string): void => {
  if (Buffer.byteLength(payload, "utf8") > maxDiagramBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }
};

export const storeDiagram = async (diagram: DiagramRecord): Promise<void> => {
  const payload = JSON.stringify(diagram);
  ensurePayloadSize(payload);
  await store.set(diagram.key, payload, {
    metadata: {
      label: diagram.label,
      createdAt: diagram.createdAt,
    },
  });
};

export const deleteDiagram = async (key: string): Promise<void> => {
  await store.delete(key);
};

export const getDiagramByKey = async (key: string): Promise<DiagramRecord | null> => {
  const diagram = await store.get(key, { type: "json" });
  if (!diagram) {
    return null;
  }
  return diagram as DiagramRecord;
};

const listDiagramKeys = async (prefix?: string): Promise<string[]> => {
  const keys: string[] = [];
  let cursor: string | undefined;

  do {
    const { blobs, cursor: nextCursor } = await store.list({
      cursor,
      prefix,
    });
    keys.push(...blobs.map((blob) => blob.key));
    cursor = nextCursor;
  } while (cursor);

  return keys;
};

export const listAllDiagrams = async (): Promise<DiagramRecord[]> => {
  const keys = await listDiagramKeys();
  const diagrams = await Promise.all(
    keys.map(async (key) => {
      try {
        return await getDiagramByKey(key);
      } catch (error) {
        console.error(`Failed to load diagram ${key}`, error);
        return null;
      }
    })
  );

  return diagrams
    .filter((diagram): diagram is DiagramRecord => Boolean(diagram))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const getLatestDiagramByLabel = async (
  label: string
): Promise<DiagramRecord | null> => {
  const keys = await listDiagramKeys(`${label}/`);
  if (keys.length === 0) {
    return null;
  }

  const diagrams = await Promise.all(
    keys.map(async (key) => {
      try {
        return await getDiagramByKey(key);
      } catch (error) {
        console.error(`Failed to load diagram ${key}`, error);
        return null;
      }
    })
  );

  const filtered = diagrams.filter(
    (diagram): diagram is DiagramRecord =>
      Boolean(diagram) && diagram.label === label
  );

  if (filtered.length === 0) {
    return null;
  }

  filtered.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return filtered[0];
};
