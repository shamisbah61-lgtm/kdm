import { X, Printer } from 'lucide-react';

export default function OrderDetailsModal({ selectedOrder, setSelectedOrder, handlePrintInvoice }) {
  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center backdrop-blur-sm">
      <div className="card animate-fade-in w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto p-8 relative">
        <button 
          onClick={() => setSelectedOrder(null)}
          className="absolute top-6 right-6 bg-transparent border-none text-[var(--color-text-bright)] cursor-pointer"
        >
          <X size={24} />
        </button>
        
        <h2 className="mb-6 border-b border-[var(--border-color)] pb-4">
          Order Details <span className="text-[var(--color-primary)]">#{selectedOrder.id}</span>
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-[var(--color-text-dim)] mb-2">Customer Information</h4>
            <p><strong>Name:</strong> {selectedOrder.full_name}</p>
            <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
            <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            <p>
              <strong>Status:</strong> 
              <span className={`badge ${selectedOrder.status === 'Delivered' ? 'badge-success' : 'badge-error'} ml-2`}>
                {selectedOrder.status}
              </span>
            </p>
          </div>
          
          <div>
            <h4 className="text-[var(--color-text-dim)] mb-2">Shipping Address</h4>
            {selectedOrder.address ? (
              <>
                <p>{selectedOrder.address.name}</p>
                <p>{selectedOrder.address.address}, {selectedOrder.address.city}</p>
                <p>{selectedOrder.address.state}, {selectedOrder.address.country} - {selectedOrder.address.zipcode}</p>
                <p>Phone: {selectedOrder.address.phone}</p>
              </>
            ) : (
              <p>No shipping address provided.</p>
            )}
          </div>
        </div>

        <h4 className="text-[var(--color-text-dim)] mb-4">Order Items</h4>
        <table className="w-full border-collapse text-left mb-6">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--color-text-dim)]">
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedOrder.items?.map(item => (
              <tr key={item.id} className="border-b border-[rgba(255,255,255,0.05)]">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} className="w-10 h-10 object-cover rounded" alt="" />
                    <span>{item.product?.name || 'Unknown Product'}</span>
                  </div>
                </td>
                <td className="p-3">₹{item.price}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3 text-right font-bold">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-[var(--border-color)] pt-4">
          <div className="w-[300px]">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>₹{selectedOrder.total_amount}</span>
            </div>
            <div className="flex justify-between text-[18px] font-bold text-[var(--color-primary)] mt-2 pt-2 border-t border-dashed border-[var(--border-color)]">
              <span>Grand Total:</span>
              <span>₹{selectedOrder.total_amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-end">
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => handlePrintInvoice(selectedOrder.id)}
          >
            <Printer size={16} /> Print Full Invoice
          </button>
          <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
        </div>
      </div>
    </div>
  );
}
