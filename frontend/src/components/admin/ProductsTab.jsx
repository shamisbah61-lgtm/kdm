import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsTab({ products, setActionModal, deleteItem }) {
  return (
    <div className="animate-fade-in card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3>Manage Products</h3>
        <button className="btn btn-primary px-4 py-2" onClick={() => setActionModal({ isOpen: true, type: 'product', data: null })}><Plus size={16}/> Add Product</button>
      </div>
      {products.length === 0 ? (
        <p className="text-[var(--color-text-dim)]">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--color-text-dim)]">
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-[var(--border-color)]">
                  <td className="p-3">
                    <img src={product.images?.[0]?.image_url || '/placeholder.png'} alt={product.name} className="w-10 h-10 object-cover rounded bg-[var(--alt-bg)]" />
                  </td>
                  <td className="p-3 font-bold">{product.name}</td>
                  <td className="p-3 text-[var(--color-primary)]">₹{product.price}</td>
                  <td className="p-3">{product.quantity || product.stock || 0}</td>
                  <td className="p-3 text-right">
                    <button className="btn btn-icon btn-secondary mr-2" onClick={() => setActionModal({ isOpen: true, type: 'product', data: product })}><Edit size={16}/></button>
                    <button className="btn btn-icon btn-danger" onClick={() => deleteItem('product', product.slug)}><Trash2 size={16}/></button>
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
