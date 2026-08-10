import { DollarSign, Package, Eye } from 'lucide-react';

export default function OverviewTab({ stats, orders, setSelectedOrder }) {
  return (
    <div className="animate-fade-in">
      <h1 className="mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5 mb-8">
        <div className="card p-6 flex items-center gap-4">
          <div className="bg-[rgba(204,12,57,0.1)] p-4 rounded-full text-[var(--color-primary)]">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[var(--color-text-dim)] text-[13px] uppercase">Total Revenue</p>
            <h3 className="text-[24px]">₹{stats.revenue.toFixed(2)}</h3>
          </div>
        </div>
        <div className="card p-6 flex items-center gap-4">
          <div className="bg-[rgba(21,128,61,0.1)] p-4 rounded-full text-[var(--color-success)]">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[var(--color-text-dim)] text-[13px] uppercase">Total Orders</p>
            <h3 className="text-[24px]">{stats.total_orders}</h3>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="mb-6">Recent Orders</h3>
        {orders.length === 0 ? (
          <p className="text-[var(--color-text-dim)]">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--color-text-dim)]">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0,5).map(order => (
                  <tr key={order.id} className="border-b border-[rgba(255,255,255,0.05)]">
                    <td className="p-3 font-bold">#{order.id}</td>
                    <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-3">{order.full_name}</td>
                    <td className="p-3 text-[var(--color-primary)]">₹{order.total_amount}</td>
                    <td className="p-3">
                      <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-error'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button 
                        className="btn btn-secondary px-2 py-1" 
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
