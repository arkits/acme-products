import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";
import type { SchemaObject } from "../types";
import SideDrawer from "../components/SideDrawer";

export default function ProductObjects() {
  const { product } = useOutletContext<ProductOutletContext>();
  const [selected, setSelected] = useState<{ object: SchemaObject; sourceName: string } | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(true);

  // No-op effect placeholder kept if future logic needed
  useEffect(() => {}, []);

  const grouped = useMemo(() => {
    return product.dataSources.map((ds) => ({
      id: ds.id,
      name: ds.name,
      kind: ds.kind,
      objects: (ds.schema?.objects || [])
        .filter((o) => (showFeaturedOnly ? o.featured !== false : true))
        .slice()
        .sort((a, b) => (b.fields?.length || 0) - (a.fields?.length || 0)),
    }));
  }, [product, showFeaturedOnly]);

  return (
    <section className="rounded-xl glass">
      <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white flex items-center justify-between">
        <div>Data Dictionary</div>
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showFeaturedOnly}
            onChange={(e) => setShowFeaturedOnly(e.target.checked)}
            className="accent-amber-400"
          />
          Featured only
        </label>
      </div>
      <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {grouped.map((g) => (
          <div key={g.id} className="rounded-lg glass">
            <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
              <div>
                <div className="text-sm font-medium text-white">{g.name}</div>
                <div className="text-xs text-zinc-400">{g.objects.length} objects</div>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs ${g.kind === "dataset" ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800" : "bg-sky-900/30 text-sky-300 border border-sky-800"}`}>{g.kind.toUpperCase()}</span>
            </div>
            <div className="p-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.objects.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected({ object: o, sourceName: g.name })}
                  className="rounded-md glass px-3 py-2 text-left text-sm text-zinc-300 hover:border-zinc-700/80 transition-colors cursor-pointer min-w-0"
                  title={o.name}
                >
                  <div className="text-white truncate">{o.name}</div>
                  <div className="text-xs text-zinc-400">{o.fields?.length ?? 0} fields</div>
                </button>
              ))}
              {g.objects.length === 0 && (
                <div className="text-sm text-zinc-400">No objects.</div>
              )}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="col-span-full text-sm text-zinc-400">No objects parsed from schemas.</div>
        )}
      </div>

      <SideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.object.name || ""}
        subtitle={selected?.sourceName}
      >
        <div>
          <div className="text-sm font-medium text-white">Description</div>
          <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">
            {selected?.object.description || "No description provided."}
          </p>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-white">Fields</div>
            <div className="text-xs text-zinc-400">{selected?.object.fields?.length ?? 0} total</div>
          </div>
          {(!selected?.object.fields || selected.object.fields.length === 0) ? (
            <div className="mt-2 text-sm text-zinc-400">No fields.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {selected.object.fields.map((f) => (
                <li key={`${selected.object.name}-${f.name}`} className="flex items-center justify-between rounded-md border border-zinc-800/60 bg-black/10 px-3 py-2">
                  <span className="font-mono text-sm text-white break-all">{f.name}</span>
                  <span className="ml-3 shrink-0 rounded border border-zinc-800/60 bg-zinc-900/40 px-2 py-0.5 text-xs text-zinc-300">{f.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SideDrawer>
    </section>
  );
}


