import { useState } from "react";
import type { UpsertProductInput } from "../types";
import { upsertProduct } from "../storage";
import FileDropzone from "../components/FileDropzone";
import { parseAvroSchema } from "../utils/avro";
import { parseOpenApi } from "../utils/openapi";
import { useNavigate } from "react-router-dom";

type DraftSource = UpsertProductInput["dataSources"][number];

export default function NewProduct() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [draft, setDraft] = useState<UpsertProductInput>({
    name: "",
    description: "",
    lineOfBusiness: "",
    dataSources: [],
  });

  function addSource(kind: DraftSource["kind"]) {
    setDraft((d) => ({
      ...d,
      dataSources: [...d.dataSources, { name: "", kind, description: "" }],
    }));
  }

  function updateSource(idx: number, updates: Partial<DraftSource>) {
    setDraft((d) => ({
      ...d,
      dataSources: d.dataSources.map((s, i) => i === idx ? { ...s, ...updates } : s),
    }));
  }

  function removeSource(idx: number) {
    setDraft((d) => ({ ...d, dataSources: d.dataSources.filter((_, i) => i !== idx) }));
  }

  function canSave() {
    return draft.name.trim() && draft.lineOfBusiness.trim() && draft.dataSources.length > 0;
  }

  async function handleSave() {
    setAttemptedSave(true);
    if (!canSave()) return;
    setSaving(true);
    const prod = upsertProduct(draft);
    setSaving(false);
    navigate(`/product/${prod.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Create Data Product</h2>
        <p className="mt-1 text-sm text-zinc-400">Provide core metadata and link at least one data source.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Name</label>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Core Banking - Transactions Hub" className={`mt-1 w-full rounded-md border bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 ${attemptedSave && !draft.name.trim() ? "border-rose-700 focus:ring-rose-600" : "border-zinc-800 focus:ring-indigo-600"}`} />
            {attemptedSave && !draft.name.trim() && (
              <div className="mt-1 text-xs text-rose-400">Name is required.</div>
            )}
          </div>
          <div>
            <label className="text-sm text-zinc-300">Description</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
        </div>
        <div>
          <label className="text-sm text-zinc-300">Line of Business</label>
          <input list="lob-options" value={draft.lineOfBusiness} onChange={(e) => setDraft({ ...draft, lineOfBusiness: e.target.value })} placeholder="e.g. Retail Banking" className={`mt-1 w-full rounded-md border bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 ${attemptedSave && !draft.lineOfBusiness.trim() ? "border-rose-700 focus:ring-rose-600" : "border-zinc-800 focus:ring-indigo-600"}`} />
          <datalist id="lob-options">
            <option value="Retail Banking" />
            <option value="Cards" />
            <option value="Payments" />
            <option value="Compliance" />
            <option value="Wealth" />
            <option value="Commercial" />
          </datalist>
          {attemptedSave && !draft.lineOfBusiness.trim() && (
            <div className="mt-1 text-xs text-rose-400">Line of Business is required.</div>
          )}
          <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
            <div className="text-zinc-300">Product preview</div>
            <ul className="mt-2 space-y-1">
              <li>Sources: <span className="text-zinc-200">{draft.dataSources.length}</span></li>
              <li>Parsed objects: <span className="text-zinc-200">{draft.dataSources.reduce((n, ds) => n + (ds.schema?.objects.length || 0), 0)}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Data Sources</div>
            <div className="text-xs text-zinc-400">Datasets (AVRO) or APIs (OpenAPI/Swagger JSON)</div>
          </div>
        <div className="flex items-center gap-2">
            <button onClick={() => addSource("dataset")} className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500">+ Dataset</button>
            <button onClick={() => addSource("api")} className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500">+ API</button>
          </div>
        </div>
        <div className="divide-y divide-zinc-800">
          {draft.dataSources.map((s, idx) => (
            <div key={idx} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-zinc-300">
                  {s.kind === "dataset" ? "Dataset" : "API"}
                  {s.schema && (
                    <span className="ml-2 rounded-sm border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-[11px] text-zinc-400">{s.schema.objects.length} objects</span>
                  )}
                </div>
                <button onClick={() => removeSource(idx)} className="text-xs text-rose-400 hover:text-rose-300">Remove</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input placeholder={s.kind === "dataset" ? "Dataset name (e.g. users_dataset)" : "API name (e.g. users_api)"} value={s.name} onChange={(e) => updateSource(idx, { name: e.target.value })} className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-1" />
                <input placeholder="Optional description" value={s.description || ""} onChange={(e) => updateSource(idx, { description: e.target.value })} className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 md:col-span-2" />
              </div>
              <div className="text-xs text-zinc-500">Upload schema: {s.kind === "dataset" ? "AVRO JSON (.json/.avsc)" : "OpenAPI/Swagger JSON (.json)"}</div>
              <FileDropzone onTextLoaded={(text) => {
                try {
                  const schema = s.kind === "dataset" ? parseAvroSchema(text) : parseOpenApi(text);
                  updateSource(idx, { schema });
                } catch (e: any) {
                  alert(e?.message || "Failed to parse schema");
                }
              }} />
              {s.schema && (
                <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-300">
                  <div className="mb-2 text-zinc-400">Parsed objects: {s.schema.objects.length}</div>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-zinc-400">{JSON.stringify(s.schema.objects.slice(0, 3), null, 2)}{s.schema.objects.length > 3 ? "\n..." : ""}</pre>
                </div>
              )}
            </div>
          ))}
          {draft.dataSources.length === 0 && (
            <div className="p-6 text-sm text-zinc-400">No data sources yet. Add a dataset or API.</div>
          )}
        </div>
      </div>

      <div className="sticky bottom-4 z-10">
        <div className="mx-auto max-w-7xl rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-end gap-3">
            <button onClick={handleSave} disabled={!canSave() || saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? "Saving..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


