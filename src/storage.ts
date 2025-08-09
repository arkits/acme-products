import type { DataProduct, PersistedState, UpsertProductInput, UUID } from "./types";

const STORAGE_KEY = "acme.dataProducts.v1";

function readState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { products: [], version: 1 };
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.products) return { products: [], version: 1 };
    return parsed;
  } catch {
    return { products: [], version: 1 };
  }
}

function writeState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId(prefix = "id"): UUID {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export function getAllProducts(): DataProduct[] {
  return readState().products;
}

export function getProductById(id: UUID): DataProduct | undefined {
  return readState().products.find((p) => p.id === id);
}

export function upsertProduct(input: UpsertProductInput, existingId?: UUID): DataProduct {
  const now = new Date().toISOString();
  const state = readState();
  let product: DataProduct;
  if (existingId) {
    const idx = state.products.findIndex((p) => p.id === existingId);
    const prev = idx >= 0 ? state.products[idx] : undefined;
    const id = existingId;
    product = {
      id,
      name: input.name,
      description: input.description,
      lineOfBusiness: input.lineOfBusiness,
      dataSources: input.dataSources.map((ds) => ({
        id: ds.id ?? generateId("ds"),
        name: ds.name,
        kind: ds.kind,
        description: ds.description,
        schema: ds.schema,
      })),
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };
    if (idx >= 0) state.products[idx] = product;
    else state.products.push(product);
  } else {
    product = {
      id: generateId("prod"),
      name: input.name,
      description: input.description,
      lineOfBusiness: input.lineOfBusiness,
      dataSources: input.dataSources.map((ds) => ({
        id: ds.id ?? generateId("ds"),
        name: ds.name,
        kind: ds.kind,
        description: ds.description,
        schema: ds.schema,
      })),
      createdAt: now,
      updatedAt: now,
    };
    state.products.unshift(product);
  }
  writeState(state);
  return product;
}

export function updateProduct(product: DataProduct): void {
  const state = readState();
  const idx = state.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    state.products[idx] = {
      ...product,
      updatedAt: new Date().toISOString()
    };
    writeState(state);
  }
}

export function deleteProduct(id: UUID): void {
  const state = readState();
  state.products = state.products.filter((p) => p.id !== id);
  writeState(state);
}

export function seedIfEmpty(seed: DataProduct[]): void {
  const state = readState();
  if (state.products.length === 0) {
    writeState({ products: seed, version: 1 });
  }
}

export function clearAllProducts(): void {
  writeState({ products: [], version: 1 });
}


