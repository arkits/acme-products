import { useState } from "react";
import { clearAllProducts, seedIfEmpty } from "../storage";
import { makeSeedProducts } from "../mock";

export default function Settings() {
  const [status, setStatus] = useState<string>("");

  function handleResetSeed() {
    clearAllProducts();
    seedIfEmpty(makeSeedProducts());
    setStatus("Seed data has been reset.");
    setTimeout(() => setStatus(""), 3000);
  }

  function handleDeleteAll() {
    if (!confirm("Delete ALL products from localStorage?")) return;
    clearAllProducts();
    setStatus("All products deleted.");
    setTimeout(() => setStatus(""), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="mt-1 text-sm text-zinc-400">Manage local data and seed content.</p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-sm font-medium text-white">Seed Data</div>
        <p className="mt-1 text-sm text-zinc-400">Reset your local data to the default sample products.</p>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={handleResetSeed} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Reset to Seed</button>
          <button onClick={handleDeleteAll} className="rounded-md border border-rose-700 bg-rose-900/30 px-3 py-1.5 text-sm text-rose-300 hover:bg-rose-900/50">Delete All</button>
          {status && <span className="text-xs text-zinc-400">{status}</span>}
        </div>
      </section>
    </div>
  );
}


