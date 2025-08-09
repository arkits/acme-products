import { Link } from "react-router-dom";
import { useState } from "react";
import type { ProductOutletContext } from "./ProductDetail";
import { useOutletContext } from "react-router-dom";
import type { DataSource, UpsertProductInput } from "../types";
import { generateId, updateProduct } from "../storage";
import FileDropzone from "../components/FileDropzone";
import { parseAvroSchema } from "../utils/avro";
import { parseOpenApi } from "../utils/openapi";
import YAML from "yaml";

export default function ProductSources() {
  const { product } = useOutletContext<ProductOutletContext>();
  const [sources, setSources] = useState<DataSource[]>([...product.dataSources]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<UpsertProductInput["dataSources"][number] | null>(null);

  const sortedSources = [...sources].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  function startAdd(kind: "dataset" | "api") {
    setDraft({ name: "", description: "", kind });
    setIsAdding(true);
  }

  function updateDraft(updates: Partial<UpsertProductInput["dataSources"][number]>) {
    setDraft((d) => (d ? { ...d, ...updates } : d));
  }

  function cancelAdd() {
    setIsAdding(false);
    setDraft(null);
  }

  function canAdd() {
    return !!draft && !!draft.name.trim();
  }

  function handleAdd() {
    if (!draft) return;
    if (!draft.name.trim()) return;
    const newSource: DataSource = {
      id: generateId("ds"),
      name: draft.name.trim(),
      kind: draft.kind,
      description: draft.description?.trim() || undefined,
      schema: draft.schema,
    };
    const updatedSources = [...sources, newSource];
    setSources(updatedSources);
    updateProduct({ ...product, dataSources: updatedSources, updatedAt: new Date().toISOString() });
    cancelAdd();
  }
  return (
    <section className="rounded-xl glass">
      <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white flex items-center justify-between">
        <div>Sources</div>
        <div className="flex items-center gap-2">
          <button onClick={() => startAdd("dataset")} className="btn-primary px-3 py-1.5 text-xs">+ Dataset</button>
          <button onClick={() => startAdd("api")} className="btn-primary px-3 py-1.5 text-xs">+ API</button>
        </div>
      </div>

      {/* Add new source form */}
      {isAdding && draft && (
        <div className="p-4 border-b border-zinc-800/60">
          <div className="mb-3 text-xs text-zinc-400">{draft.kind === "dataset" ? "Dataset" : "API"}</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              placeholder={draft.kind === "dataset" ? "Dataset name (e.g. users_dataset)" : "API name (e.g. users_api)"}
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              className={`input-glass md:col-span-1 ${!draft.name.trim() ? "ring-2 ring-rose-500/50" : "focus:ring-[var(--ring)]"}`}
            />
            <input
              placeholder="Optional description"
              value={draft.description || ""}
              onChange={(e) => updateDraft({ description: e.target.value })}
              className="input-glass md:col-span-2 focus:ring-[var(--ring)]"
            />
          </div>
          {!draft.schema && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-zinc-500">
                Upload schema: {draft.kind === "dataset" ? "AVRO JSON (.json/.avsc)" : "OpenAPI/Swagger JSON or YAML (.json/.yaml/.yml)"}
              </div>
              <FileDropzone
                accept={draft.kind === "dataset" ? ".json,.avsc" : ".json,.yaml,.yml"}
                onTextLoaded={(text) => {
                  try {
                    const schema = draft.kind === "dataset" ? parseAvroSchema(text) : parseOpenApi(text);
                    const inferred: Partial<UpsertProductInput["dataSources"][number]> = { schema };
                    if (draft.kind === "api") {
                      let parsed: unknown = null;
                      try { parsed = JSON.parse(text); } catch { /* ignore invalid JSON */ }
                      if (!parsed) { try { parsed = YAML.parse(text); } catch { /* ignore invalid YAML */ } }
                      if (parsed && typeof parsed === 'object') {
                        const obj = parsed as { info?: { title?: unknown; description?: unknown } };
                        const title = typeof obj.info?.title === 'string' ? obj.info.title : undefined;
                        const desc = typeof obj.info?.description === 'string' ? obj.info.description : undefined;
                        if (title && !draft.name) inferred.name = title.toLowerCase().replace(/\s+/g, "_") + "_api";
                        if (desc && !draft.description) inferred.description = desc;
                      }
                    } else {
                      try {
                        const parsed = JSON.parse(schema.raw) as { name?: unknown; type?: { name?: unknown }; doc?: unknown };
                        const typeName = typeof parsed.type?.name === 'string' ? parsed.type?.name : undefined;
                        const name = typeof parsed.name === 'string' ? parsed.name : typeName;
                        if (name && !draft.name) inferred.name = String(name).toLowerCase() + "_dataset";
                        if (typeof parsed.doc === 'string' && !draft.description) inferred.description = parsed.doc;
                      } catch { /* ignore */ }
                    }
                    updateDraft(inferred);
                  } catch (e: unknown) {
                    const message = e instanceof Error ? e.message : String(e);
                    alert(message || "Failed to parse schema");
                  }
                }}
              />
            </div>
          )}
          {draft.schema && (
            <div className="mt-3 rounded-md glass p-3">
              <div className="mb-2 text-xs text-zinc-400">Parsed objects: {draft.schema.objects.length}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {draft.schema.objects.slice(0, 6).map((o, i) => (
                  <div key={i} className="rounded-md glass px-3 py-2 text-sm text-zinc-300">
                    <div className="text-white">{o.name}</div>
                    <div className="text-xs text-zinc-400">{o.fields?.length ?? 0} fields</div>
                  </div>
                ))}
              </div>
              {draft.schema.objects.length > 6 && (
                <div className="mt-2 text-xs text-zinc-400">+ {draft.schema.objects.length - 6} more objects</div>
              )}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={handleAdd} disabled={!canAdd()} className="btn-primary text-xs px-3 py-1">Add Source</button>
            <button onClick={cancelAdd} className="btn-ghost text-xs px-3 py-1">Cancel</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-800/60">
        {sortedSources.map((ds) => (
          <Link key={ds.id} to={`/product/${product.id}/sources/${ds.id}`} className="block p-4 hover:bg-white/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-300 hover:text-white">{ds.name}</div>
                <div className="text-xs text-zinc-500">{ds.description}</div>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs ${ds.kind === "dataset" ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800" : "bg-sky-900/30 text-sky-300 border border-sky-800"}`}>{ds.kind.toUpperCase()}</span>
            </div>
            <div className="mt-3 text-xs text-zinc-400">Objects: {ds.schema?.objects.length || 0}</div>
          </Link>
        ))}
      </div>
      {sortedSources.length === 0 && (
        <div className="p-6 text-sm text-zinc-400">No data sources linked.</div>
      )}
    </section>
  );
}


