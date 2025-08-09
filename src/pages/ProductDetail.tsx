import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { deleteProduct, getProductById } from "../storage";
import type { DataProduct } from "../types";

export type ProductOutletContext = { product: DataProduct };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return <div className="text-slate-400">Product not found. <Link className="text-indigo-400" to="/">Go back</Link></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <Link to="/" className="text-indigo-400">Browse</Link>
            <span>/</span>
            <span>{product.lineOfBusiness}</span>
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-white">{product.name}</h2>
          <p className="mt-1 max-w-3xl text-zinc-400">{product.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (confirm("Delete this product?")) { deleteProduct(product.id); navigate("/"); } }}
            className="rounded-md border border-rose-700 bg-rose-900/30 px-3 py-1.5 text-sm text-rose-300 hover:bg-rose-900/50"
          >
            Delete
          </button>
        </div>
      </div>

      <div>
        <div className="border-b border-zinc-800">
          <div className="-mb-px flex items-center gap-6">
            <TabLink to="sources" label="Sources" />
            <TabLink to="objects" label="Objects" />
            <TabLink to="consume" label="Consume" />
          </div>
        </div>
        <div className="pt-6">
          <Outlet context={{ product }} />
        </div>
      </div>
    </div>
  );
}

function TabLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `border-b-2 px-1.5 py-2 text-sm transition-colors ${isActive ? "border-indigo-500 text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
      end
    >
      {label}
    </NavLink>
  );
}


