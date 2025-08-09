import type { CurlSnippet, DataSourceSchema, SchemaObject, SqlSnippet } from "../types";

export function parseAvroSchema(raw: string): DataSourceSchema {
  // We support simple AVRO record JSONs. We do not support AVSC with imports.
  let json: any;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    throw new Error("Invalid AVRO JSON");
  }

  const objects: SchemaObject[] = [];

  function collectRecord(node: any) {
    if (!node) return;
    const isRecord = node.type === "record" || node.type?.type === "record";
    if (isRecord) {
      const name = node.name || node.type?.name || "Record";
      const fields = (node.fields || node.type?.fields || []).map((f: any) => ({
        name: f.name ?? "field",
        type: typeof f.type === "string" ? f.type : f.type?.type ?? "unknown",
      }));
      objects.push({ name, fields });
    }
    // Recurse through nested types/fields
    const fields = node.fields || node.type?.fields;
    if (Array.isArray(fields)) {
      for (const f of fields) {
        if (typeof f.type === "object") collectRecord(f.type);
        if (Array.isArray(f.type)) {
          for (const t of f.type) if (typeof t === "object") collectRecord(t);
        }
      }
    }
  }

  if (Array.isArray(json)) {
    json.forEach(collectRecord);
  } else if (typeof json === "object") {
    collectRecord(json);
  }

  return {
    raw,
    objects,
  };
}

export function avroSqlSnippets(datasetName: string, objects: SchemaObject[]): SqlSnippet[] {
  const first = objects[0];
  const fields = first?.fields?.map((f) => f.name).slice(0, 5) ?? ["*"];
  const select = `SELECT ${fields.join(", ")}\nFROM ${datasetName}\nLIMIT 100;`;
  return [
    { title: "Preview sample rows", body: select },
    { title: "Count rows", body: `SELECT COUNT(*) AS row_count\nFROM ${datasetName};` },
  ];
}

export function avroCurlSnippets(): CurlSnippet[] {
  return [
    {
      title: "Download file (example)",
      body: "curl -L https://data.acme.example/datasets/<dataset>/export.csv -o export.csv",
    },
  ];
}


