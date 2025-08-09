import { useMemo, useState } from "react";
import { getAllProducts } from "../storage";

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
  meta?: Record<string, string>;
};

export default function ObjectsTree() {
  const products = getAllProducts();
  const [query, setQuery] = useState("");

  const tree = useMemo<TreeNode[]>(() => {
    const nodes: TreeNode[] = [];
    for (const product of products) {
      const prodNode: TreeNode = { id: product.id, label: product.name, children: [] };
      for (const ds of product.dataSources) {
        const dsNode: TreeNode = { id: ds.id, label: ds.name, children: [] };
        const objs = ds.schema?.objects || [];
        for (const obj of objs) {
          dsNode.children!.push({ id: `${ds.id}:${obj.name}`, label: obj.name, meta: { source: ds.name, product: product.name } });
        }
        prodNode.children!.push(dsNode);
      }
      nodes.push(prodNode);
    }
    return nodes;
  }, [products]);

  const filteredTree = useMemo(() => filterTree(tree, query.trim().toLowerCase()), [tree, query]);

  return (
    <div className="px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Data Dictionary</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search objects, sources, products..." className="input-glass w-96 focus:ring-[var(--ring)]" />
        </div>
      </div>
      <div className="">
        <div className="mx-auto max-w-7xl rounded-xl glass p-4">
          {filteredTree.length === 0 ? (
            <div className="text-sm text-zinc-400">No results.</div>
          ) : (
            <Tree nodes={filteredTree} level={0} />
          )}
        </div>
      </div>
    </div>
  );
}

function Tree({ nodes, level }: { nodes: TreeNode[]; level: number }) {
  return (
    <ul className="space-y-1">
      {nodes.map((n) => (
        <li key={n.id}>
          <TreeRow node={n} level={level} />
          {n.children && n.children.length > 0 && (
            <div className="ml-6 mt-1 border-l border-slate-800 pl-4">
              <Tree nodes={n.children} level={level + 1} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function TreeRow({ node, level }: { node: TreeNode; level: number }) {
  const [open, setOpen] = useState(level < 1);
  const isLeaf = !node.children || node.children.length === 0;
  return (
    <div className="group flex items-start gap-2">
      <button onClick={() => setOpen((v) => !v)} className={`mt-0.5 h-5 w-5 shrink-0 rounded btn-ghost text-xs leading-4 ${isLeaf ? "opacity-0" : "opacity-100"}`}>
        {open ? "-" : "+"}
      </button>
      <div className="flex-1 rounded-md px-1 py-0.5 text-sm">
        <span className="font-medium text-zinc-200">{node.label}</span>
        {node.meta && (
          <span className="ml-2 text-xs text-zinc-400">{Object.entries(node.meta).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span>
        )}
      </div>
    </div>
  );
}

function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  if (!q) return nodes;
  const matches = (label: string, meta?: Record<string, string>) => label.toLowerCase().includes(q) || Object.values(meta || {}).some((v) => v.toLowerCase().includes(q));
  const walk = (list: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = [];
    for (const n of list) {
      const children = n.children ? walk(n.children) : [];
      if (matches(n.label, n.meta) || children.length > 0) {
        out.push({ ...n, children });
      }
    }
    return out;
  };
  return walk(nodes);
}


