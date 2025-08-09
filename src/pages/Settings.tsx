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

      <section className="rounded-xl glass p-4">
        <div className="text-sm font-medium text-white">Seed Data</div>
        <p className="mt-1 text-sm text-zinc-400">Reset your local data to the default sample products.</p>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={handleResetSeed} className="btn-primary px-3 py-1.5">Reset to Seed</button>
          <button onClick={handleDeleteAll} className="btn-ghost text-rose-300">Delete All</button>
          {status && <span className="text-xs text-zinc-400">{status}</span>}
        </div>
      </section>
    </div>
  );
}


