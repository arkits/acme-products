import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";

export default function ProductObjects() {
  const { product } = useOutletContext<ProductOutletContext>();

  const grouped = useMemo(() => {
    return product.dataSources.map((ds) => ({
      id: ds.id,
      name: ds.name,
      kind: ds.kind,
      objects: (ds.schema?.objects || []).slice().sort((a, b) => (b.fields?.length || 0) - (a.fields?.length || 0)),
    }));
  }, [product]);

  return (
    <section className="rounded-xl glass">
      <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">Data Dictionary</div>
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
                <div key={i} className="rounded-md glass px-3 py-2 text-sm text-zinc-300">
                  <div className="text-white">{o.name}</div>
                  <div className="text-xs text-zinc-400">{o.fields?.length ?? 0} fields</div>
                </div>
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
    </section>
  );
}


