export type UUID = string;

export type DataSourceKind = "dataset" | "api";

export interface DataSourceSchema {
  // Raw schema content (stringified JSON for now)
  raw: string;
  // Parsed high-level objects extracted from the schema
  objects: SchemaObject[];
  // Optional first endpoint path (for APIs)
  firstGetEndpoint?: string;
  // Optional server URL (for APIs)
  serverUrl?: string;
  // Optional list of endpoints (METHOD path) for APIs
  endpoints?: string[];
}

export interface SchemaObjectField {
  name: string;
  type: string;
}

export interface SchemaObject {
  name: string;
  description?: string;
  fields?: SchemaObjectField[];
  featured?: boolean;
}

export interface DataSource {
  id: UUID;
  name: string;
  kind: DataSourceKind;
  description?: string;
  schema?: DataSourceSchema;
}

export interface Owner {
  name: string;
  email: string;
  team?: string;
}

export interface BusinessNeed {
  id: UUID;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UsageExample {
  id: UUID;
  name: string;
  description: string;
  code: string;
  language?: string;
}

export interface DataProduct {
  id: UUID;
  name: string;
  description: string;
  lineOfBusiness: string;
  dataSources: DataSource[];
  owner?: Owner;
  businessNeeds?: BusinessNeed[];
  usageExamples?: UsageExample[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UpsertProductInput {
  name: string;
  description: string;
  lineOfBusiness: string;
  dataSources: Array<{
    id?: UUID;
    name: string;
    kind: DataSourceKind;
    description?: string;
    schema?: DataSourceSchema;
  }>;
}

export interface PersistedState {
  products: DataProduct[];
  version: number;
}

export type SqlSnippet = {
  title: string;
  body: string;
};

export type CurlSnippet = {
  title: string;
  body: string;
};


