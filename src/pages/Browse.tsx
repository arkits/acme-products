import { useMemo, useState } from "react";
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Browse Data Products</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="input-glass w-72 focus:ring-[var(--ring)]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl glass p-8 text-center text-slate-400">No products found.</div>
        )}
      </div>
    </div>
  );
}


