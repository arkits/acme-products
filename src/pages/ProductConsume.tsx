import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";
import { avroSqlSnippets } from "../utils/avro";
import { openApiCurlSnippets } from "../utils/openapi";

export default function ProductConsume() {
  const { product } = useOutletContext<ProductOutletContext>();
  return (
    <div className="space-y-6">
      {product.dataSources.map((ds) => (
        <section key={ds.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 px-4 py-3 text-sm font-medium text-white">{ds.name}</div>
          <div className="p-4">
            {ds.kind === "dataset" ? (
              <div>
                <div className="text-xs text-zinc-400 mb-1">SQL</div>
                <CodeBlock code={avroSqlSnippets(ds.name, ds.schema?.objects || [])[0].body} />
              </div>
            ) : (
              <div>
                <div className="text-xs text-zinc-400 mb-1">curl</div>
                <CodeBlock code={openApiCurlSnippets(ds.name, ds.schema?.serverUrl, ds.schema?.firstGetEndpoint)[0].body} />
              </div>
            )}
          </div>
        </section>
      ))}
      {product.dataSources.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-sm text-zinc-400">No sources to show.</div>
      )}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200"><code>{code}</code></pre>
  );
}


