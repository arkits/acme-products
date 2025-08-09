import { Link, useOutletContext } from "react-router-dom";
import { useMemo, useState } from "react";
import type { ProductOutletContext } from "./ProductDetail";
import type { Owner } from "../types";
import { updateProduct } from "../storage";

export default function ProductOverview() {
  const { product } = useOutletContext<ProductOutletContext>();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() => ({
    name: product.name || "",
    description: product.description || "",
    lineOfBusiness: product.lineOfBusiness || "",
    owner: (product.owner || {
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      team: "Data Engineering",
    }) as Owner,
  }));

  // Mock owner if not present
  const owner = useMemo<Owner>(() => {
    return draft.owner || {
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      team: "Data Engineering",
    };
  }, [draft.owner]);

  function startEdit() {
    setDraft({
      name: product.name || "",
      description: product.description || "",
      lineOfBusiness: product.lineOfBusiness || "",
      owner: (product.owner || {
        name: "Alex Johnson",
        email: "alex.johnson@company.com",
        team: "Data Engineering",
      }) as Owner,
    });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setDraft({
      name: product.name || "",
      description: product.description || "",
      lineOfBusiness: product.lineOfBusiness || "",
      owner: (product.owner || {
        name: "Alex Johnson",
        email: "alex.johnson@company.com",
        team: "Data Engineering",
      }) as Owner,
    });
  }

  function saveEdit() {
    const updated = {
      ...product,
      name: draft.name,
      description: draft.description,
      lineOfBusiness: draft.lineOfBusiness,
      owner: draft.owner,
      updatedAt: new Date().toISOString(),
    };
    updateProduct(updated);
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={saveEdit} className="btn-primary text-xs px-3 py-1">Save</button>
            <button onClick={cancelEdit} className="btn-ghost text-xs px-3 py-1">Cancel</button>
          </div>
        ) : (
          <button onClick={startEdit} className="btn-ghost text-xs px-3 py-1">Edit</button>
        )}
      </div>
      {/* Description Section */}
      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
          Description
        </div>
        <div className="p-4">
          {isEditing ? (
            <textarea
              className="input-glass w-full min-h-24"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          ) : (
            <p className="text-zinc-300 leading-relaxed">{draft.description}</p>
          )}
        </div>
      </section>

      {/* Owner & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl glass">
          <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
            Owner
          </div>
          <div className="p-4 space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Name</label>
                  <input
                    className="input-glass w-full"
                    value={owner.name}
                    onChange={(e) => setDraft((d) => ({ ...d, owner: { ...d.owner, name: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Email</label>
                  <input
                    className="input-glass w-full"
                    value={owner.email}
                    onChange={(e) => setDraft((d) => ({ ...d, owner: { ...d.owner, email: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Team</label>
                  <input
                    className="input-glass w-full"
                    value={owner.team || ""}
                    onChange={(e) => setDraft((d) => ({ ...d, owner: { ...d.owner, team: e.target.value } }))}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-white">{owner.name}</div>
                <div className="text-sm text-zinc-400">{owner.email}</div>
                {owner.team && (
                  <div className="text-xs text-zinc-500 mt-1">{owner.team}</div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl glass">
          <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
            Basic Information
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs text-zinc-400">Name</div>
              {isEditing ? (
                <input
                  className="input w-full mt-1"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              ) : (
                <div className="text-sm text-white">{draft.name}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-zinc-400">Line of Business</div>
              {isEditing ? (
                <input
                  className="input-glass w-full mt-1"
                  value={draft.lineOfBusiness}
                  onChange={(e) => setDraft((d) => ({ ...d, lineOfBusiness: e.target.value }))}
                />
              ) : (
                <div className="text-sm text-white">{draft.lineOfBusiness}</div>
              )}
            </div>
            <div>
              <div className="text-xs text-zinc-400">Data Sources</div>
              <div className="text-sm text-white">{product.dataSources.length} sources</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Created</div>
              <div className="text-sm text-white">
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Last Updated</div>
              <div className="text-sm text-white">
                {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Data Sources Summary */}
      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
          Data Sources Overview
        </div>
        <div className="p-4">
          {product.dataSources.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {product.dataSources.map((ds) => (
                <Link
                  to={`/product/${product.id}/sources/${ds.id}`}
                  key={ds.id}
                  className="rounded-lg glass glass-hover p-3 overflow-hidden cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate" title={ds.name}>{ds.name}</div>
                      {ds.description && (
                        <div className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {ds.description}
                        </div>
                      )}
                    </div>
                    <span className={`ml-2 rounded-md px-2 py-1 text-xs flex-shrink-0 ${
                      ds.kind === "dataset" 
                        ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800" 
                        : "bg-sky-900/30 text-sky-300 border border-sky-800"
                    }`}>
                      {ds.kind.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    {ds.schema?.objects?.length || 0} objects
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-400">No data sources configured.</div>
          )}
        </div>
      </section>
    </div>
  );
}
