import type { CurlSnippet, DataSourceSchema, SchemaObject, SqlSnippet } from "../types";
import YAML from "yaml";

export function parseOpenApi(raw: string): DataSourceSchema {
  let json: unknown;
  // Try JSON first, then YAML as fallback
  try {
    json = JSON.parse(raw);
  } catch {
    try {
      json = YAML.parse(raw);
    } catch {
      throw new Error("Invalid OpenAPI. Provide JSON or YAML.");
    }
  }

  type AnyRecord = Record<string, unknown>;
  const asRecord = (val: unknown): AnyRecord | undefined =>
    typeof val === "object" && val !== null ? (val as AnyRecord) : undefined;
  const getRecord = (obj: AnyRecord, key: string): AnyRecord | undefined => {
    const v = obj[key];
    return asRecord(v);
  };
  const getArray = (obj: AnyRecord, key: string): unknown[] | undefined => {
    const v = obj[key];
    return Array.isArray(v) ? v : undefined;
  };

  const oapiObj: AnyRecord = asRecord(json) ?? {};

  const components = getRecord(oapiObj, "components");
  const definitions = getRecord(oapiObj, "definitions");
  const schemasRec: AnyRecord = getRecord(components ?? {}, "schemas") ?? definitions ?? {};

  const objects: SchemaObject[] = [];
  for (const [name, schema] of Object.entries(schemasRec)) {
    const fields: { name: string; type: string }[] = [];
    const schemaRec = asRecord(schema) ?? {};
    const props = getRecord(schemaRec, "properties") ?? {};
    for (const [pname, pval] of Object.entries(props)) {
      const pRec = asRecord(pval);
      const typeVal = pRec && typeof pRec.type === 'string' ? String(pRec.type) : 'object';
      fields.push({ name: pname, type: typeVal });
    }
    objects.push({ name, fields, featured: fields.length > 1 });
  }

  // Endpoints collection and first GET endpoint for curl
  let firstGetEndpoint: string | undefined;
  const endpoints: string[] = [];
  const paths = getRecord(oapiObj, "paths") ?? {};
  for (const [p, methods] of Object.entries(paths)) {
    const methodsObj = asRecord(methods) ?? {};
    for (const method of Object.keys(methodsObj)) {
      const methodLabel = String(method).toUpperCase();
      endpoints.push(`${methodLabel} ${p}`);
      if (!firstGetEndpoint && methodLabel === "GET") firstGetEndpoint = String(p);
    }
  }
  const servers = getArray(oapiObj, "servers");
  const server0 = Array.isArray(servers) ? asRecord(servers[0]) : undefined;
  const hostVal = oapiObj["host"];
  const host = typeof hostVal === 'string' ? hostVal : undefined;
  const serverUrl: string | undefined = (server0 && typeof server0.url === 'string') ? String(server0.url) : (host ? `https://${host}` : undefined);

  return { raw, objects, firstGetEndpoint, serverUrl, endpoints };
}

export function openApiCurlSnippets(name: string, serverUrl?: string, endpoint?: string): CurlSnippet[] {
  const sanitizeBaseUrl = (input?: string): string => {
    const fallback = "https://api.acme.example";
    if (!input) return fallback;
    const trimmed = String(input).trim();
    // Guard against literal "undefined"/"null" and non-http(s) protocols
    if (!trimmed || /^(undefined|null)$/i.test(trimmed)) return fallback;
    try {
      const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      // strip trailing slash for clean concatenation
      url.pathname = url.pathname.replace(/\/$/, "");
      return url.toString().replace(/\/$/, "");
    } catch {
      return fallback;
    }
  };

  const normalizePath = (p?: string): string => {
    const fallbackPath = "/v1/resource";
    const candidate = (p ?? fallbackPath).trim();
    if (!candidate) return fallbackPath;
    return candidate.startsWith("/") ? candidate : `/${candidate}`;
  };

  const base = sanitizeBaseUrl(serverUrl);
  const path = normalizePath(endpoint);
  return [
    { title: `GET ${name}`, body: `curl -s '${base}${path}' | jq '.'` },
    { title: "POST (example)", body: `curl -s -X POST '${base}${path}' -H 'Content-Type: application/json' -d '{"foo":"bar"}'` },
  ];
}

export function openApiSqlSnippets(name: string): SqlSnippet[] {
  return [
    { title: `Query ${name} in external table (example)`, body: `-- Example using external table\nSELECT *\nFROM external_table('${name}')\nLIMIT 100;` },
  ];
}


