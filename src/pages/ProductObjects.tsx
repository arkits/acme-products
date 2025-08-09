import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";

export default function ProductObjects() {
  const { product } = useOutletContext<ProductOutletContext>();

  const aggregateObjects = useMemo(() => {
    const items: { sourceName: string; objectName: string }[] = [];
    for (const ds of product.dataSources) {
      const objs = ds.schema?.objects || [];
      for (const o of objs) items.push({ sourceName: ds.name, objectName: o.name });
    }
    return items;
  }, [product]);

  return (
    <section className="rounded-xl glass">
      <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">Aggregate Objects</div>
      <div className="p-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {aggregateObjects.map((o, i) => (
          <div key={i} className="rounded-md glass px-3 py-2 text-sm text-zinc-300">
            <div className="text-zinc-400 text-xs">{o.sourceName}</div>
            <div className="text-white">{o.objectName}</div>
          </div>
        ))}
        {aggregateObjects.length === 0 && (
          <div className="col-span-full text-sm text-zinc-400">No objects parsed from schemas.</div>
        )}
      </div>
    </section>
  );
}


