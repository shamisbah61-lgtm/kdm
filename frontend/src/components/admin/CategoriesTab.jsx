import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CategoriesTab({ categories, setActionModal, deleteItem }) {
  return (
    <div className="animate-fade-in card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3>Manage Categories</h3>
        <button className="btn btn-primary px-4 py-2" onClick={() => setActionModal({ isOpen: true, type: 'category', data: null })}><Plus size={16}/> Add Category</button>
      </div>
      {categories.length === 0 ? (
        <p className="text-[var(--color-text-dim)]">No categories found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--color-text-dim)]">
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-[var(--border-color)]">
                  <td className="p-3 font-bold">{cat.name}</td>
                  <td className="p-3 text-[var(--color-text-muted)]">{cat.slug}</td>
                  <td className="p-3 text-right">
                    <button className="btn btn-icon btn-secondary mr-2" onClick={() => setActionModal({ isOpen: true, type: 'category', data: cat })}><Edit size={16}/></button>
                    <button className="btn btn-icon btn-danger" onClick={() => deleteItem('categorie', cat.slug)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
