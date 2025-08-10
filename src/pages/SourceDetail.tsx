import { Link, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { getProductById, updateProduct } from "../storage";

export default function SourceDetail() {
  const { id, dsId } = useParams();
  const [product, setProduct] = useState(() => (id ? getProductById(id) : undefined));
  const ds = useMemo(() => product?.dataSources.find((s) => s.id === dsId), [product, dsId]);

  if (!product || !ds) {
    return <div className="text-slate-400">Not found. <Link className="text-sky-400" to={`/product/${id}/sources`}>Back to Sources</Link></div>;
  }

  function toggleFeatured(objectName: string) {
    if (!product || !dsId) return;
    const updated = {
      ...product,
      dataSources: product.dataSources.map((s) => {
        if (s.id !== dsId) return s;
        const schema = s.schema;
        if (!schema) return s;
        const nextObjects = (schema.objects || []).map((o) =>
          o.name === objectName ? { ...o, featured: !(o.featured ?? true) } : o
        );
        return { ...s, schema: { ...schema, objects: nextObjects } };
      }),
    };
    updateProduct(updated);
    setProduct(getProductById(updated.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <Link to={`/product/${product.id}/sources`} className="text-sky-400">Sources</Link>
            <span>/</span>
            <span>{ds.name}</span>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-white">{ds.name}</h3>
          {ds.description && <p className="mt-1 text-zinc-400">{ds.description}</p>}
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs h-fit ${ds.kind === "dataset" ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800" : "bg-sky-900/30 text-sky-300 border border-sky-800"}`}>{ds.kind.toUpperCase()}</span>
      </div>

      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">Metadata</div>
        <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <MetaItem label="Objects" value={String(ds.schema?.objects.length ?? 0)} />
          {ds.kind === "api" && (
            <>
              <div className="rounded-md glass p-3 sm:col-span-1 lg:col-span-2">
                <div className="text-xs text-zinc-400">Endpoints</div>
                <div className="mt-1 text-sm text-zinc-200 space-y-1">
                  {(ds.schema?.endpoints || []).length > 0 ? (
                    <ul className="list-disc pl-5">
                      {(ds.schema?.endpoints || []).map((ep, i) => (
                        <li key={i} className="break-all">{ep}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>-</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">Structure</div>
        <div className="p-4 space-y-3">
          {[...(ds.schema?.objects || [])]
            .sort((a, b) => (b.fields?.length || 0) - (a.fields?.length || 0))
            .map((obj, i) => (
            <div key={i} className="rounded-md glass">
              <div className="border-b border-zinc-800/60 px-3 py-2 text-sm font-medium text-zinc-200 flex items-center justify-between">
                <div>{obj.name}</div>
                <button
                  type="button"
                  onClick={() => toggleFeatured(obj.name)}
                  className="text-xs rounded px-2 py-0.5 hover:bg-white/5"
                  title={(obj.featured ?? true) ? "Unfeature" : "Feature"}
                >
                  <span className={(obj.featured ?? true) ? "text-amber-400" : "text-zinc-500"}>
                    {(obj.featured ?? true) ? "★" : "☆"}
                  </span>
                  <span className="ml-1 align-middle">Featured</span>
                </button>
              </div>
              <div className="p-3 overflow-x-auto">
                {obj.fields && obj.fields.length > 0 ? (
                  <table className="min-w-full text-left text-xs">
                    <thead className="text-zinc-400">
                      <tr>
                        <th className="px-2 py-1 font-normal">Field</th>
                        <th className="px-2 py-1 font-normal">Type</th>
                      </tr>
                    </thead>
                    <tbody className="text-zinc-300">
                      {obj.fields.map((f, idx) => (
                        <tr key={idx} className="border-t border-zinc-800/60">
                          <td className="px-2 py-1">{f.name}</td>
                          <td className="px-2 py-1 text-zinc-400">{f.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-xs text-zinc-400">No fields available.</div>
                )}
              </div>
            </div>
          ))}
          {(ds.schema?.objects?.length ?? 0) === 0 && (
            <div className="text-sm text-zinc-400">No objects parsed from schema.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md glass p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm text-zinc-200 break-all">{value}</div>
    </div>
  );
}


