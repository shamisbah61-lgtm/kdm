import { Plus, Edit, Trash2 } from 'lucide-react';

export default function CouponsTab({ coupons, setActionModal, deleteItem }) {
  return (
    <div className="animate-fade-in card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3>Manage Coupons</h3>
        <button className="btn btn-primary px-4 py-2" onClick={() => setActionModal({ isOpen: true, type: 'coupon', data: null })}><Plus size={16}/> Add Coupon</button>
      </div>
      {coupons.length === 0 ? (
        <p className="text-[var(--color-text-dim)]">No coupons found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--color-text-dim)]">
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Valid Until</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-[var(--border-color)]">
                  <td className="p-3 font-bold">{coupon.code}</td>
                  <td className="p-3 text-[var(--color-primary)]">₹{coupon.discount}</td>
                  <td className="p-3">{new Date(coupon.expiry).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`badge ${coupon.active ? 'badge-success' : 'badge-error'}`}>
                      {coupon.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="btn btn-icon btn-secondary mr-2" onClick={() => setActionModal({ isOpen: true, type: 'coupon', data: coupon })}><Edit size={16}/></button>
                    <button className="btn btn-icon btn-danger" onClick={() => deleteItem('coupon', coupon.code)}><Trash2 size={16}/></button>
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
