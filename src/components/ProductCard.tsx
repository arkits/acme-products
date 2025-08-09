import { Link } from "react-router-dom";
import type { DataProduct } from "../types";

export default function ProductCard({ product }: { product: DataProduct }) {
  const totalObjects = product.dataSources.reduce((sum, ds) => sum + (ds.schema?.objects.length || 0), 0);
  return (
    <Link to={`/product/${product.id}`} className="group block rounded-xl glass p-5 glass-hover transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-white group-hover:text-indigo-300 transition-colors">{product.name}</h3>
          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{product.description}</p>
        </div>
        <span className="rounded-md btn-ghost px-2.5 py-1 text-xs">{product.lineOfBusiness}</span>
      </div>
      <div className="mt-4 flex items-center gap-6 text-sm text-zinc-400">
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"></span>{product.dataSources.length} sources</div>
        <div className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-400"></span>{totalObjects} objects</div>
      </div>
    </Link>
  );
}


