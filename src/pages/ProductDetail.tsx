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
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { if (confirm("Delete this product?")) { deleteProduct(product.id); navigate("/"); } }}
            className="btn-ghost text-rose-300"
          >
            Delete
          </button>
        </div>
      </div>

      <div>
        <div className="border-b border-zinc-800/60">
          <div className="-mb-px flex items-center gap-6 overflow-x-auto">
            <TabLink to="overview" label="Overview" />
            <TabLink to="business-needs" label="Business Needs" />
            <TabLink to="sources" label="Sources" />
            <TabLink to="data-dictionary" label="Data Dictionary" />
            <TabLink to="usage-examples" label="Usage Examples" />
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
      className={({ isActive }) => `${isActive ? "tab-link tab-link-active" : "tab-link"}`}
      end
    >
      {label}
    </NavLink>
  );
}


