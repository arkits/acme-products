import type { CurlSnippet, DataSourceSchema, SchemaObject, SqlSnippet } from "../types";
import YAML from "yaml";

export function parseOpenApi(raw: string): DataSourceSchema {
  let json: any;
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

  const objects: SchemaObject[] = [];
  const schemas = json?.components?.schemas || json?.definitions || {};
  for (const [name, schema] of Object.entries<any>(schemas)) {
    const fields: { name: string; type: string }[] = [];
    const props = schema.properties || {};
    for (const [pname, pval] of Object.entries<any>(props)) {
      fields.push({ name: pname, type: typeof pval.type === "string" ? pval.type : "object" });
    }
    objects.push({ name, fields });
  }

  // Endpoints collection and first GET endpoint for curl
  let firstGetEndpoint: string | undefined;
  const endpoints: string[] = [];
  const paths = json.paths || {};
  for (const [p, methods] of Object.entries<any>(paths)) {
    for (const [method] of Object.entries<any>(methods)) {
      const methodLabel = String(method).toUpperCase();
      endpoints.push(`${methodLabel} ${p}`);
      if (!firstGetEndpoint && methodLabel === "GET") firstGetEndpoint = p;
    }
  }
  const serverUrl: string | undefined = json.servers?.[0]?.url || json.host ? `https://${json.host}` : undefined;

  return { raw, objects, firstGetEndpoint, serverUrl, endpoints };
}

export function openApiCurlSnippets(name: string, serverUrl?: string, endpoint?: string): CurlSnippet[] {
  const base = serverUrl || "https://api.acme.example";
  const path = endpoint || "/v1/resource";
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


