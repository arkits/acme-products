import { Link, useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";

export default function ProductSources() {
  const { product } = useOutletContext<ProductOutletContext>();
  const sources = [...product.dataSources].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="border-b border-zinc-800 px-4 py-3 text-sm font-medium text-white">Sources</div>
      <div className="divide-y divide-slate-800">
        {sources.map((ds) => (
          <Link key={ds.id} to={`/product/${product.id}/sources/${ds.id}`} className="block p-4 hover:bg-zinc-900/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-300 hover:text-white">{ds.name}</div>
                <div className="text-xs text-zinc-500">{ds.description}</div>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-xs ${ds.kind === "dataset" ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800" : "bg-sky-900/30 text-sky-300 border border-sky-800"}`}>{ds.kind}</span>
            </div>
            <div className="mt-3 text-xs text-zinc-400">Objects: {ds.schema?.objects.length || 0}</div>
          </Link>
        ))}
      </div>
      {product.dataSources.length === 0 && (
        <div className="p-6 text-sm text-zinc-400">No data sources linked.</div>
      )}
    </section>
  );
}


