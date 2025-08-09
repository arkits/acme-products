import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ProductOutletContext } from "./ProductDetail";
import type { BusinessNeed } from "../types";
import { updateProduct } from "../storage";

export default function ProductBusinessNeeds() {
  const { product } = useOutletContext<ProductOutletContext>();
  const [businessNeeds, setBusinessNeeds] = useState<BusinessNeed[]>(product.businessNeeds || []);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newNeed, setNewNeed] = useState<Omit<BusinessNeed, 'id'>>({
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSave = () => {
    const updatedProduct = {
      ...product,
      businessNeeds,
      updatedAt: new Date().toISOString()
    };
    updateProduct(updatedProduct);
    setIsEditing(null);
  };

  const handleAdd = () => {
    if (newNeed.title.trim() && newNeed.description.trim()) {
      const need: BusinessNeed = {
        id: crypto.randomUUID(),
        ...newNeed
      };
      const updatedNeeds = [...businessNeeds, need];
      setBusinessNeeds(updatedNeeds);
      
      const updatedProduct = {
        ...product,
        businessNeeds: updatedNeeds,
        updatedAt: new Date().toISOString()
      };
      updateProduct(updatedProduct);
      
      setNewNeed({ title: '', description: '', priority: 'medium' });
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string, field: string, value: string) => {
    setBusinessNeeds(prev => prev.map(need => 
      need.id === id ? { ...need, [field]: value } : need
    ));
  };

  const handleDelete = (id: string) => {
    const updatedNeeds = businessNeeds.filter(need => need.id !== id);
    setBusinessNeeds(updatedNeeds);
    
    const updatedProduct = {
      ...product,
      businessNeeds: updatedNeeds,
      updatedAt: new Date().toISOString()
    };
    updateProduct(updatedProduct);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/30 text-red-300 border-red-800';
      case 'low': return 'bg-gray-900/30 text-gray-300 border-gray-800';
      default: return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl glass">
        <div className="border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-medium text-white">Business Needs</div>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary text-xs px-3 py-1"
          >
            Add Need
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Add new business need form */}
          {isAdding && (
            <div className="rounded-lg glass p-4 border border-indigo-800/50">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newNeed.title}
                    onChange={(e) => setNewNeed(prev => ({ ...prev, title: e.target.value }))}
                    className="input w-full"
                    placeholder="Enter business need title..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Description</label>
                  <textarea
                    value={newNeed.description}
                    onChange={(e) => setNewNeed(prev => ({ ...prev, description: e.target.value }))}
                    className="input w-full h-20 resize-none"
                    placeholder="Describe the business need..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select
                    value={newNeed.priority}
                    onChange={(e) => setNewNeed(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="btn-primary text-xs px-3 py-1">
                    Add
                  </button>
                  <button 
                    onClick={() => {
                      setIsAdding(false);
                      setNewNeed({ title: '', description: '', priority: 'medium' });
                    }}
                    className="btn-ghost text-xs px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing business needs */}
          {businessNeeds.length > 0 ? (
            <div className="space-y-3">
              {businessNeeds.map((need) => (
                <div key={need.id} className="rounded-lg glass p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {isEditing === need.id ? (
                        <>
                          <input
                            type="text"
                            value={need.title}
                            onChange={(e) => handleEdit(need.id, 'title', e.target.value)}
                            className="input w-full"
                          />
                          <textarea
                            value={need.description}
                            onChange={(e) => handleEdit(need.id, 'description', e.target.value)}
                            className="input w-full h-20 resize-none"
                          />
                          <select
                            value={need.priority}
                            onChange={(e) => handleEdit(need.id, 'priority', e.target.value)}
                            className="input w-32"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-medium text-white">{need.title}</h3>
                            <span className={`rounded-md px-2 py-1 text-xs border ${getPriorityColor(need.priority)}`}>
                              {need.priority?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {need.description}
                          </p>
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {isEditing === need.id ? (
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
                            onClick={() => setIsEditing(need.id)}
                            className="btn-ghost text-xs px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this business need?')) {
                                handleDelete(need.id);
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
                </div>
              ))}
            </div>
          ) : (
            !isAdding && (
              <div className="text-center py-8">
                <div className="text-sm text-zinc-400">No business needs defined yet.</div>
                <button
                  onClick={() => setIsAdding(true)}
                  className="btn-primary text-xs px-3 py-1 mt-3"
                >
                  Add First Business Need
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
