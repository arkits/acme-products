import { useState } from "react";
import { clearAllProducts, deleteProduct, getAllProducts, seedIfEmpty } from "../storage";
import { makeSeedProducts } from "../mock";

export default function Settings() {
  const [status, setStatus] = useState<string>("");
  const [products, setProducts] = useState(() => getAllProducts());

  function handleResetSeed() {
    clearAllProducts();
    seedIfEmpty(makeSeedProducts());
    setStatus("Seed data has been reset.");
    setProducts(getAllProducts());
    setTimeout(() => setStatus(""), 3000);
  }

  function handleDeleteAll() {
    if (!confirm("Delete ALL products from localStorage?")) return;
    clearAllProducts();
    setStatus("All products deleted.");
    setProducts([]);
    setTimeout(() => setStatus(""), 3000);
  }

  function handleDeleteOne(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    deleteProduct(id);
    setProducts(getAllProducts());
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="mt-1 text-sm text-zinc-400">Manage local data and seed content.</p>
      </div>

      <section className="rounded-xl glass p-4">
        <div className="text-sm font-medium text-white">Seed Data</div>
        <p className="mt-1 text-sm text-zinc-400">Reset your local data to the default sample products.</p>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={handleResetSeed} className="btn-primary px-3 py-1.5">Reset to Seed</button>
          <button onClick={handleDeleteAll} className="btn-ghost text-rose-300">Delete All</button>
          {status && <span className="text-xs text-zinc-400">{status}</span>}
        </div>
      </section>

      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">Delete Data Products</div>
        <div className="divide-y divide-zinc-800/60">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{p.name}</div>
                <div className="text-xs text-zinc-400 truncate">{p.lineOfBusiness}</div>
              </div>
              <button onClick={() => handleDeleteOne(p.id)} className="btn-ghost text-xs text-rose-300">Delete</button>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-4 text-sm text-zinc-400">No products.</div>
          )}
        </div>
      </section>
    </div>
  );
}


