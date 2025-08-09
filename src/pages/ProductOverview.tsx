import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";

export default function ProductOverview() {
  const { product } = useOutletContext<ProductOutletContext>();

  // Mock owner if not present
  const owner = product.owner || {
    name: "Alex Johnson",
    email: "alex.johnson@company.com",
    team: "Data Engineering"
  };

  return (
    <div className="space-y-6">
      {/* Description Section */}
      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
          Description
        </div>
        <div className="p-4">
          <p className="text-zinc-300 leading-relaxed">{product.description}</p>
        </div>
      </section>

      {/* Owner & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-xl glass">
          <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
            Owner
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-sm font-medium text-white">{owner.name}</div>
              <div className="text-sm text-zinc-400">{owner.email}</div>
              {owner.team && (
                <div className="text-xs text-zinc-500 mt-1">{owner.team}</div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl glass">
          <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
            Basic Information
          </div>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs text-zinc-400">Line of Business</div>
              <div className="text-sm text-white">{product.lineOfBusiness}</div>
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
                <div key={ds.id} className="rounded-lg glass p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{ds.name}</div>
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
                </div>
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
