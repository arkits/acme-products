import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../storage";
import ProductCard from "../components/ProductCard";

export default function Browse() {
  const [q, setQ] = useState("");
  const products = getAllProducts();
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(t) ||
      p.description.toLowerCase().includes(t) ||
      p.lineOfBusiness.toLowerCase().includes(t)
    );
  }, [q, products]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const p of filtered) {
      const key = p.lineOfBusiness || "General";
      if (!map.has(key)) map.set(key, [] as typeof filtered);
      const arr = map.get(key)!;
      arr.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Browse Data Products</h2>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="input-glass w-72 focus:ring-[var(--ring)]" />
          <Link to="/new" className="btn-primary text-xs px-3 py-1 whitespace-nowrap">New Data Product</Link>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl glass p-8 text-center text-slate-400">No products found.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([lob, prods]) => (
            <section key={lob} className="rounded-xl glass">
              <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">{lob}</div>
              <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {prods.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}


