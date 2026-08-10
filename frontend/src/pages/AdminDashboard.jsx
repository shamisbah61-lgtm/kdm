import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

import AdminSidebar from '../components/admin/AdminSidebar';
import OverviewTab from '../components/admin/OverviewTab';
import OrdersTab from '../components/admin/OrdersTab';
import ProductsTab from '../components/admin/ProductsTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import CouponsTab from '../components/admin/CouponsTab';
import OrderDetailsModal from '../components/admin/OrderDetailsModal';
import AdminActionModal from '../components/admin/AdminActionModal';

export default function AdminDashboard() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total_orders: 0, revenue: 0, products: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, data: null });
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const statsRes = await apiRequest('/admin/stats/');
        const ordersRes = await apiRequest('/admin/orders/');
        if (statsRes.success) setStats(statsRes.data);
        if (ordersRes.success) setOrders(ordersRes.data);
      } else if (activeTab === 'orders') {
        const res = await apiRequest('/admin/orders/');
        if (res.success) setOrders(res.data);
      } else if (activeTab === 'products') {
        const res = await apiRequest('/products/');
        if (res.success) setProducts(res.data);
      } else if (activeTab === 'categories') {
        const res = await apiRequest('/categories/');
        if (res.success) setCategories(res.data);
      } else if (activeTab === 'coupons') {
        const res = await apiRequest('/coupons/');
        if (res.success) setCoupons(res.data);
      }
    } catch (error) {
      showToast('Error loading data');
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    const res = await apiRequest(`/admin/orders/${orderId}/update-status/`, {
      method: 'POST',
      body: { status }
    });
    if (res.success) {
      showToast('Status updated successfully', 'success');
      fetchData();
    } else {
      showToast(res.message || 'Error updating status');
    }
  };

  const deleteItem = async (type, idOrSlug) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    const endpoint = type === 'categorie' ? `/categories/${idOrSlug}/` : `/${type}s/${idOrSlug}/`;
    const res = await apiRequest(endpoint, { method: 'DELETE' });
    if (res.success) {
      showToast(`${type} deleted successfully`, 'success');
      fetchData();
    } else {
      showToast(res.message || `Error deleting ${type}`);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = actionModal.type;
    const isEdit = !!actionModal.data;
    const idOrSlug = isEdit ? (actionModal.data.slug || actionModal.data.code) : '';

    let endpoint = type === 'category' ? '/categories/' : `/${type}s/`;
    let method = isEdit ? 'PUT' : 'POST';

    if (isEdit) {
      endpoint += `${idOrSlug}/`;
    }

    let bodyData;
    if (type === 'product') {
      bodyData = formData; 
    } else {
      bodyData = Object.fromEntries(formData.entries());
    }

    const res = await apiRequest(endpoint, { method, body: bodyData });
    if (res.success) {
      setActionModal({ isOpen: false, type: null, data: null });
      fetchData();
      showToast('Saved successfully', 'success');
    } else {
      showToast(res.message || 'An error occurred while saving.', 'error');
    }
  };

  const handlePrintInvoice = async (orderId) => {
    const res = await apiRequest(`/orders/${orderId}/invoice-html/`);
    if (res.success && res.data.html) {
      const win = window.open('', '_blank');
      win.document.write(res.data.html);
      win.document.close();
      win.setTimeout(() => {
        win.print();
      }, 500);
    } else {
      showToast('Error generating invoice', 'error');
    }
  };

  return (
    <div className="container animate-fade-in pb-[80px] mt-5">
      <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} navigate={navigate} logout={logout} />

        <div className="flex-1 flex flex-col gap-6 w-full overflow-hidden">
          {loading ? (
            <div className="card p-10 text-center text-[var(--color-text-dim)]">Loading data...</div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab stats={stats} orders={orders} setSelectedOrder={setSelectedOrder} />}
              {activeTab === 'orders' && <OrdersTab orders={orders} updateOrderStatus={updateOrderStatus} setSelectedOrder={setSelectedOrder} handlePrintInvoice={handlePrintInvoice} />}
              {activeTab === 'products' && <ProductsTab products={products} setActionModal={setActionModal} deleteItem={deleteItem} />}
              {activeTab === 'categories' && <CategoriesTab categories={categories} setActionModal={setActionModal} deleteItem={deleteItem} />}
              {activeTab === 'coupons' && <CouponsTab coupons={coupons} setActionModal={setActionModal} deleteItem={deleteItem} />}
            </>
          )}
        </div>
      </div>

      <OrderDetailsModal selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} handlePrintInvoice={handlePrintInvoice} />
      <AdminActionModal actionModal={actionModal} setActionModal={setActionModal} handleActionSubmit={handleActionSubmit} categories={categories} />

      {toast.show && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${toast.type === 'error' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-success)]'} text-white px-7 py-3.5 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 z-[9999] text-[15px] font-medium animate-[fade-in_0.3s_ease]`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
