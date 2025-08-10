import type { CurlSnippet, DataSourceSchema, SchemaObject, SqlSnippet } from "../types";

export function parseAvroSchema(raw: string): DataSourceSchema {
  // We support simple AVRO record JSONs. We do not support AVSC with imports.
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("Invalid AVRO JSON");
  }

  const objects: SchemaObject[] = [];

  type AvroRecordLike = {
    type?: unknown;
    name?: unknown;
    fields?: unknown;
  };

  const isObject = (val: unknown): val is Record<string, unknown> =>
    typeof val === "object" && val !== null;

  const getTypeString = (val: unknown): string => {
    if (typeof val === "string") return val;
    if (isObject(val) && typeof (val as { type?: unknown }).type === "string") {
      return String((val as { type?: unknown }).type);
    }
    return "unknown";
  };

  function collectRecord(node: unknown): void {
    if (!isObject(node)) return;
    const n = node as AvroRecordLike;
    const recordType = (n.type as { type?: unknown } | string | undefined);
    const isRecord = recordType === "record" || (isObject(recordType) && (recordType as { type?: unknown }).type === "record");
    if (isRecord) {
      const nameCandidate = (n.name as unknown) ?? (isObject(n.type) ? (n.type as Record<string, unknown>).name : undefined);
      const name = typeof nameCandidate === "string" ? nameCandidate : "Record";
      const fieldsArray = (n.fields as unknown) ?? (isObject(n.type) ? (n.type as Record<string, unknown>).fields : undefined);
      const array = Array.isArray(fieldsArray) ? (fieldsArray as unknown[]) : [];
      const fields = array.map((fUnknown) => {
        const f = fUnknown as { name?: unknown; type?: unknown };
        const fieldName = typeof f.name === "string" ? f.name : "field";
        const fieldType = getTypeString(f.type);
        return { name: fieldName, type: fieldType };
      });
      objects.push({ name, fields, featured: true });
    }
    // Recurse through nested types/fields
    const nestedFields = (n.fields as unknown) ?? (isObject(n.type) ? (n.type as Record<string, unknown>).fields : undefined);
    if (Array.isArray(nestedFields)) {
      for (const f of nestedFields as unknown[]) {
        const t = isObject(f) ? (f as Record<string, unknown>).type : undefined;
        if (isObject(t)) collectRecord(t);
        if (Array.isArray(t)) {
          for (const u of t as unknown[]) if (isObject(u)) collectRecord(u);
        }
      }
    }
  }

  if (Array.isArray(json)) {
    (json as unknown[]).forEach(collectRecord);
  } else if (typeof json === "object" && json !== null) {
    collectRecord(json as Record<string, unknown>);
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


