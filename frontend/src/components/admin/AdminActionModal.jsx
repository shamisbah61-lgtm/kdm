import { X } from 'lucide-react';

export default function AdminActionModal({ actionModal, setActionModal, handleActionSubmit, categories }) {
  if (!actionModal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center backdrop-blur-sm">
      <div className="card animate-fade-in w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto p-8 relative">
        <button 
          onClick={() => setActionModal({ isOpen: false, type: null, data: null })}
          className="absolute top-6 right-6 bg-transparent border-none text-[var(--color-text-bright)] cursor-pointer"
        >
          <X size={24} />
        </button>
        
        <h2 className="mb-6 border-b border-[var(--border-color)] pb-4">
          {actionModal.data ? 'Edit' : 'Add'} {actionModal.type === 'category' ? 'Category' : actionModal.type === 'coupon' ? 'Coupon' : 'Product'}
        </h2>

        <form onSubmit={handleActionSubmit} className="flex flex-col gap-4">
          {actionModal.type === 'category' && (
            <>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Category Name</label>
                <input name="name" defaultValue={actionModal.data?.name || ''} className="form-input" required />
              </div>
            </>
          )}
          {actionModal.type === 'coupon' && (
            <>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Coupon Code</label>
                <input name="code" defaultValue={actionModal.data?.code || ''} className="form-input" required />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Discount Amount (₹)</label>
                <input type="number" name="discount" defaultValue={actionModal.data?.discount || ''} className="form-input" required min="1" step="0.01" />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Minimum Order Amount (₹)</label>
                <input type="number" name="minimum_amount" defaultValue={actionModal.data?.minimum_amount || '0'} className="form-input" required min="0" step="0.01" />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Expiry Date</label>
                <input type="datetime-local" name="expiry" defaultValue={actionModal.data ? new Date(actionModal.data.expiry).toISOString().slice(0, 16) : ''} className="form-input" required />
              </div>
            </>
          )}
          {actionModal.type === 'product' && (
            <>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Product Name</label>
                <input name="name" defaultValue={actionModal.data?.name || ''} className="form-input" required />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Price (₹)</label>
                <input type="number" step="0.01" name="price" defaultValue={actionModal.data?.price || ''} className="form-input" required />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Stock Quantity</label>
                <input type="number" name="quantity" defaultValue={actionModal.data?.quantity || actionModal.data?.stock || ''} className="form-input" required />
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Category</label>
                <select name="category" defaultValue={actionModal.data?.category?.id || ''} className="form-input" required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Short Description</label>
                <textarea name="short_description" defaultValue={actionModal.data?.short_description || ''} className="form-input" rows="2" required></textarea>
              </div>
              <div>
                <label className="block mb-2 text-[var(--color-text-dim)]">Product Images</label>
                <input type="file" name="uploaded_images" multiple accept="image/*" className="form-input" />
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3 justify-end">
            <button type="submit" className="btn btn-primary px-6 py-2">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setActionModal({ isOpen: false, type: null, data: null })}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
