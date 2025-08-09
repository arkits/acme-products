import { useMemo, useState } from "react";
import { getAllProducts } from "../storage";

type Field = { name: string; type?: string };
type SourceRef = { name: string; kind: "dataset" | "api" };
type ProductObject = { name: string; fields: Field[]; sources: SourceRef[] };
type ProductGroup = { productId: string; productName: string; objects: ProductObject[] };
type LobGroup = { lob: string; products: ProductGroup[] };

export default function ObjectsGraph() {
  const products = getAllProducts();
  const [query, setQuery] = useState("");

  const groups = useMemo<LobGroup[]>(() => buildGroups(products), [products]);
  const filtered = useMemo(() => filterGroups(groups, query), [groups, query]);

  return (
    <div className="px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Data Dictionary</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search objects..." className="input-glass w-96 focus:ring-[var(--ring)]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl glass p-6 text-sm text-zinc-400">No results.</div>
        ) : (
          filtered.map((lob) => (
            <LobSection key={lob.lob} lob={lob} />
          ))
        )}
      </div>
    </div>
  );
}

function LobSection({ lob }: { lob: LobGroup }) {
  return (
    <section className="rounded-xl glass">
      <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">{lob.lob}</div>
      <div className="divide-y divide-zinc-800/60">
        {lob.products.map((pg) => (
          <ProductSection key={pg.productId} group={pg} />
        ))}
      </div>
    </section>
  );
}

function ProductSection({ group }: { group: ProductGroup }) {
  return (
    <div>
      <div className="px-4 py-3 text-sm text-zinc-300">{group.productName}</div>
      <div className="border-t border-zinc-800/60 p-4">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {group.objects.map((obj) => (
            <li key={obj.name} className="rounded-lg glass">
              <ObjectCard object={obj} />
            </li>
          ))}
          {group.objects.length === 0 && (
            <li className="col-span-full text-sm text-zinc-500">No objects.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ObjectCard({ object }: { object: ProductObject }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{open ? "▾" : "▸"}</span>
          <div>
            <div className="text-sm font-medium text-white">{object.name}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {object.sources.map((s) => (
                <span key={`${s.name}-${s.kind}`} className="inline-flex items-center gap-1 rounded-md btn-ghost px-2 py-0.5 text-[11px]">
                  <span>{s.name}</span>
                  <span className={`rounded-sm px-1 ${s.kind === "dataset" ? "bg-emerald-900/40 text-emerald-300" : "bg-sky-900/40 text-sky-300"}`}>{s.kind}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>
      {open && (
        <div className="border-t border-zinc-800/60 p-3">
          <div className="text-xs font-medium text-zinc-300">Fields</div>
          <table className="mt-2 w-full text-left text-xs">
            <thead className="text-zinc-500">
              <tr><th className="px-1 py-1 font-normal">Name</th><th className="px-1 py-1 font-normal">Type</th></tr>
            </thead>
            <tbody className="text-zinc-300">
              {object.fields.map((f, i) => (
                <tr key={i} className="border-t border-zinc-800/60">
                  <td className="px-1 py-1">{f.name}</td>
                  <td className="px-1 py-1 text-zinc-500">{f.type || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function buildGroups(products: ReturnType<typeof getAllProducts>): LobGroup[] {
  const lobMap = new Map<string, Map<string, ProductGroup>>();
  for (const p of products) {
    const lob = p.lineOfBusiness || "General";
    if (!lobMap.has(lob)) lobMap.set(lob, new Map());
    const productMap = lobMap.get(lob)!;
    if (!productMap.has(p.id)) productMap.set(p.id, { productId: p.id, productName: p.name, objects: [] });
    const group = productMap.get(p.id)!;

    // Aggregate objects per product (merge by name; collect sources)
    const objectMap = new Map<string, ProductObject>();
    for (const ds of p.dataSources) {
      const objs = ds.schema?.objects || [];
      for (const o of objs) {
        const existing = objectMap.get(o.name);
        const fields = o.fields || [];
        if (!existing) {
          objectMap.set(o.name, { name: o.name, fields: [...fields], sources: [{ name: ds.name, kind: ds.kind }] });
        } else {
          // merge fields
          const known = new Set(existing.fields.map((f) => f.name));
          for (const f of fields) if (!known.has(f.name)) existing.fields.push({ name: f.name, type: f.type });
          if (!existing.sources.some((s) => s.name === ds.name && s.kind === ds.kind)) existing.sources.push({ name: ds.name, kind: ds.kind });
        }
      }
    }
    group.objects = Array.from(objectMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Convert to array, sort by lob/product
  const result: LobGroup[] = [];
  for (const [lob, productMap] of lobMap.entries()) {
    result.push({ lob, products: Array.from(productMap.values()).sort((a, b) => a.productName.localeCompare(b.productName)) });
  }
  result.sort((a, b) => a.lob.localeCompare(b.lob));
  return result;
}

function filterGroups(groups: LobGroup[], query: string): LobGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  const filtered: LobGroup[] = [];
  for (const lob of groups) {
    const products: ProductGroup[] = [];
    for (const pg of lob.products) {
      const objects = pg.objects.filter((o) => o.name.toLowerCase().includes(q));
      if (objects.length > 0) products.push({ ...pg, objects });
    }
    if (products.length > 0) filtered.push({ lob: lob.lob, products });
  }
  return filtered;
}


