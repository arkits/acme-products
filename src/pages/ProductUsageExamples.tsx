import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";
import type { UsageExample } from "../types";
import { updateProduct } from "../storage";
import { avroSqlSnippets } from "../utils/avro";
import { openApiCurlSnippets } from "../utils/openapi";

export default function ProductUsageExamples() {
  const { product } = useOutletContext<ProductOutletContext>();
  const [usageExamples, setUsageExamples] = useState<UsageExample[]>(product.usageExamples || []);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newExample, setNewExample] = useState<Omit<UsageExample, 'id'>>({
    name: '',
    description: '',
    code: '',
    language: 'sql'
  });

  const handleSave = () => {
    const updatedProduct = {
      ...product,
      usageExamples,
      updatedAt: new Date().toISOString()
    };
    updateProduct(updatedProduct);
    setIsEditing(null);
  };

  const handleAdd = () => {
    if (newExample.name.trim() && newExample.description.trim() && newExample.code.trim()) {
      const example: UsageExample = {
        id: crypto.randomUUID(),
        ...newExample
      };
      const updatedExamples = [...usageExamples, example];
      setUsageExamples(updatedExamples);
      
      const updatedProduct = {
        ...product,
        usageExamples: updatedExamples,
        updatedAt: new Date().toISOString()
      };
      updateProduct(updatedProduct);
      
      setNewExample({ name: '', description: '', code: '', language: 'sql' });
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, field: string, value: string) => {
    setUsageExamples(prev => prev.map(example => 
      example.id === id ? { ...example, [field]: value } : example
    ));
  };

  const handleDelete = (id: string) => {
    const updatedExamples = usageExamples.filter(example => example.id !== id);
    setUsageExamples(updatedExamples);
    
    const updatedProduct = {
      ...product,
      usageExamples: updatedExamples,
      updatedAt: new Date().toISOString()
    };
    updateProduct(updatedProduct);
  };

  const getLanguageColor = (language?: string) => {
    switch (language?.toLowerCase()) {
      case 'sql': return 'bg-blue-900/30 text-blue-300 border-blue-800';
      case 'python': return 'bg-green-900/30 text-green-300 border-green-800';
      case 'javascript': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
      case 'curl': return 'bg-orange-900/30 text-orange-300 border-orange-800';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-generated examples from data sources */}
      {product.dataSources.length > 0 && (
        <section className="rounded-xl glass">
          <div className="border-b border-zinc-800/60 px-4 py-3 text-sm font-medium text-white">
            Auto-generated Examples
          </div>
          <div className="p-4 space-y-4">
            {product.dataSources.map((ds) => (
              <div key={ds.id} className="rounded-lg glass">
                <div className="border-b border-zinc-800/60 px-4 py-3">
                  <div className="text-sm font-medium text-white">{ds.name}</div>
                  <div className="text-xs text-zinc-400">Basic usage example</div>
                </div>
                <div className="p-4">
                  {ds.kind === "dataset" ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-zinc-400">Language:</span>
                        <span className={`rounded-md px-2 py-1 text-xs border ${getLanguageColor('sql')}`}>
                          SQL
                        </span>
                      </div>
                      <CodeBlock code={avroSqlSnippets(ds.name, ds.schema?.objects || [])[0].body} />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-zinc-400">Language:</span>
                        <span className={`rounded-md px-2 py-1 text-xs border ${getLanguageColor('curl')}`}>
                          CURL
                        </span>
                      </div>
                      <CodeBlock code={openApiCurlSnippets(ds.name, ds.schema?.serverUrl, ds.schema?.firstGetEndpoint)[0].body} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom usage examples */}
      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-medium text-white">Custom Usage Examples</div>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary text-xs px-3 py-1"
          >
            Add Example
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Add new example form */}
          {isAdding && (
            <div className="rounded-lg glass p-4 border border-indigo-800/50">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={newExample.name}
                    onChange={(e) => setNewExample(prev => ({ ...prev, name: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter example name..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <textarea
                    value={newExample.description}
                    onChange={(e) => setNewExample(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full h-16 resize-none"
                    placeholder="Describe what this example demonstrates..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Language</label>
                  <select
                    value={newExample.language}
                    onChange={(e) => setNewExample(prev => ({ ...prev, language: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="sql">SQL</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="curl">cURL</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Code</label>
                  <textarea
                    value={newExample.code}
                    onChange={(e) => setNewExample(prev => ({ ...prev, code: e.target.value }))}
                    className="input w-full h-32 resize-none font-mono text-xs"
                    placeholder="Enter your code example..."
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="btn-primary text-xs px-3 py-1">
                    Add Example
                  </button>
                  <button 
                    onClick={() => {
                      setIsAdding(false);
                      setNewExample({ name: '', description: '', code: '', language: 'sql' });
                    }}
                    className="btn-ghost text-xs px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing custom examples */}
          {usageExamples.length > 0 ? (
            <div className="space-y-4">
              {usageExamples.map((example) => (
                <div key={example.id} className="rounded-lg glass">
                  <div className="border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
                    <div>
                      {isEditing === example.id ? (
                        <input
                          type="text"
                          value={example.name}
                          onChange={(e) => handleEdit(example.id, 'name', e.target.value)}
                          className="input text-sm font-medium"
                        />
                      ) : (
                        <div className="text-sm font-medium text-white">{example.name}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {isEditing === example.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="btn-primary text-xs px-2 py-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setIsEditing(null)}
                            className="btn-ghost text-xs px-2 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setIsEditing(example.id)}
                            className="btn-ghost text-xs px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this example?')) {
                                handleDelete(example.id);
                              }
                            }}
                            className="btn-ghost text-rose-300 text-xs px-2 py-1"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {isEditing === example.id ? (
                      <>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Description</label>
                          <textarea
                            value={example.description}
                            onChange={(e) => handleEdit(example.id, 'description', e.target.value)}
                            className="input w-full h-16 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Language</label>
                          <select
                            value={example.language}
                            onChange={(e) => handleEdit(example.id, 'language', e.target.value)}
                            className="input w-32"
                          >
                            <option value="sql">SQL</option>
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="curl">cURL</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Code</label>
                          <textarea
                            value={example.code}
                            onChange={(e) => handleEdit(example.id, 'code', e.target.value)}
                            className="input w-full h-32 resize-none font-mono text-xs"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-zinc-300">{example.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-zinc-400">Language:</span>
                          <span className={`rounded-md px-2 py-1 text-xs border ${getLanguageColor(example.language)}`}>
                            {example.language?.toUpperCase()}
                          </span>
                        </div>
                        <CodeBlock code={example.code} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isAdding && (
              <div className="text-center py-8">
                <div className="text-sm text-zinc-400">No custom usage examples yet.</div>
                <button
                  onClick={() => setIsAdding(true)}
                  className="btn-primary text-xs px-3 py-1 mt-3"
                >
                  Add First Example
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-auto rounded-md code-block p-3 text-xs text-zinc-200"><code>{code}</code></pre>
  );
}
