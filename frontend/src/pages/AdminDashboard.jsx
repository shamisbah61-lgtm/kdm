import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { Package, Users, DollarSign, Activity, ShoppingBag, Grid, Tag, ListOrdered, ChevronRight, Edit, Trash2, Plus, Printer, Eye, X, Home, LogOut } from 'lucide-react';

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

  const showToast = (message, type = 'error') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      if (type === 'error') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
      }
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { console.warn("Audio not supported"); }

    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'error' });
    }, 3000);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'orders') {
        const ordersRes = await apiRequest('/orders/');
        if (ordersRes.success) {
          const orderList = ordersRes.data.results || ordersRes.data || [];
          setOrders(orderList);
          const revenue = orderList.reduce((acc, order) => acc + parseFloat(order.total_amount || 0), 0);
          setStats(prev => ({ ...prev, total_orders: orderList.length, revenue }));
        }
      }
      
      if (activeTab === 'products') {
        const prodRes = await apiRequest('/products/');
        if (prodRes.success) {
          setProducts(prodRes.data.results || prodRes.data || []);
        }
        if (categories.length === 0) {
          const catRes = await apiRequest('/categories/');
          if (catRes.success) {
            setCategories(catRes.data.results || catRes.data || []);
          }
        }
      }

      if (activeTab === 'categories') {
        const catRes = await apiRequest('/categories/');
        if (catRes.success) {
          setCategories(catRes.data.results || catRes.data || []);
        }
      }

      if (activeTab === 'coupons') {
        const couponRes = await apiRequest('/coupons/');
        if (couponRes.success) {
          setCoupons(couponRes.data.results || couponRes.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    const res = await apiRequest(`/orders/${orderId}/`, {
      method: 'PATCH',
      body: { status }
    });
    if (res.success) {
      fetchData();
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    const res = await apiRequest(`/${type}s/${id}/`, { method: 'DELETE' });
    if (res.success) {
      fetchData();
      showToast(`${type} deleted successfully`, 'success');
    } else {
      showToast(res.message || 'Failed to delete', 'error');
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    let method = actionModal.data ? 'PATCH' : 'POST';
    let endpoint = '';
    let bodyData;

    if (actionModal.type === 'category') {
      endpoint = actionModal.data ? `/categories/${actionModal.data.slug}/` : '/categories/';
      bodyData = Object.fromEntries(formData.entries());
    } else if (actionModal.type === 'coupon') {
      bodyData = Object.fromEntries(formData.entries());
      const selectedDate = new Date(bodyData.expiry);
      const today = new Date();
      if (selectedDate < today) {
        showToast("Expiry date cannot be in the past!", "error");
        return;
      }
      bodyData.active = true;
      endpoint = actionModal.data ? `/coupons/${actionModal.data.code}/` : '/coupons/';
    } else if (actionModal.type === 'product') {
      endpoint = actionModal.data ? `/products/${actionModal.data.slug}/` : '/products/';
      
      const images = formData.getAll('uploaded_images');
      if (images.length > 0 && images[0].size === 0) {
        formData.delete('uploaded_images');
      }
      bodyData = formData;
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
      showToast(res.message || 'Failed to load invoice.', 'error');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'orders', label: 'Orders', icon: ListOrdered },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '32px', minHeight: '70vh' }}>
        
        {/* Admin Sidebar */}
        <div className="card" style={{ width: '280px', padding: '24px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '24px', color: 'var(--color-primary)' }}>Admin Panel</h2>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: isActive ? 'rgba(204,12,57,0.1)' : 'transparent',
                  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  borderRadius: 'var(--border-radius-md)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-bright)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={20} />
                  <span style={{ fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            )
          })}
          
          <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
               <Home size={16} /> Go to Storefront
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => { logout(); navigate('/login'); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
               <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {loading ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-dim)' }}>Loading data...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <h1 style={{ marginBottom: '32px' }}>Dashboard Overview</h1>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: 'rgba(204,12,57,0.1)', padding: '16px', borderRadius: '50%', color: 'var(--color-primary)' }}>
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', textTransform: 'uppercase' }}>Total Revenue</p>
                        <h3 style={{ fontSize: '24px' }}>₹{stats.revenue.toFixed(2)}</h3>
                      </div>
                    </div>
                    <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ background: 'rgba(21,128,61,0.1)', padding: '16px', borderRadius: '50%', color: 'var(--color-success)' }}>
                        <Package size={24} />
                      </div>
                      <div>
                        <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', textTransform: 'uppercase' }}>Total Orders</p>
                        <h3 style={{ fontSize: '24px' }}>{stats.total_orders}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px' }}>Recent Orders</h3>
                    {orders.length === 0 ? (
                      <p style={{ color: 'var(--color-text-dim)' }}>No orders found.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-dim)' }}>
                              <th style={{ padding: '12px' }}>Order ID</th>
                              <th style={{ padding: '12px' }}>Date</th>
                              <th style={{ padding: '12px' }}>Customer</th>
                              <th style={{ padding: '12px' }}>Total</th>
                              <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0,5).map(order => (
                              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order.id}</td>
                                <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '12px' }}>{order.full_name}</td>
                                <td style={{ padding: '12px', color: 'var(--color-primary)' }}>₹{order.total_amount}</td>
                                <td style={{ padding: '12px' }}>
                                  <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-error'}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px' }}
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
              )}

              {activeTab === 'orders' && (
                <div className="animate-fade-in card" style={{ padding: '24px' }}>
                  <h3 style={{ marginBottom: '24px' }}>Manage Orders</h3>
                  {orders.length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)' }}>No orders found.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-dim)' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Customer</th>
                            <th style={{ padding: '12px' }}>Total</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order.id}</td>
                              <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                              <td style={{ padding: '12px' }}>{order.full_name}</td>
                              <td style={{ padding: '12px', color: 'var(--color-primary)' }}>₹{order.total_amount}</td>
                              <td style={{ padding: '12px' }}>
                                <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : 'badge-error'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td style={{ padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select 
                                  className="form-input" 
                                  style={{ padding: '6px', fontSize: '12px', width: 'auto', minWidth: '100px' }}
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button 
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="View Order Details"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Print Invoice"
                                  onClick={() => handlePrintInvoice(order.id)}
                                >
                                  <Printer size={14} />
                                </button>
                                <a
                                  href={`https://wa.me/?text=Hi ${order.full_name || 'Customer'}, your KDM order %23${order.order_number || order.id} is currently ${order.status}. Total amount is ₹${order.total_amount}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary"
                                  style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', color: '#25D366' }}
                                  title="Share Order Update on WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div className="animate-fade-in card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3>Manage Products</h3>
                    <button className="btn btn-primary" onClick={() => setActionModal({ isOpen: true, type: 'product', data: null })} style={{ padding: '8px 16px' }}><Plus size={16}/> Add Product</button>
                  </div>
                  {products.length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)' }}>No products found.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-dim)' }}>
                            <th style={{ padding: '12px' }}>Image</th>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Price</th>
                            <th style={{ padding: '12px' }}>Stock</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '12px' }}>
                                <img src={product.images?.[0]?.image_url || '/placeholder.png'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: 'var(--alt-bg)' }} />
                              </td>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{product.name}</td>
                              <td style={{ padding: '12px', color: 'var(--color-primary)' }}>₹{product.price}</td>
                              <td style={{ padding: '12px' }}>{product.quantity || product.stock || 0}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button className="btn btn-icon btn-secondary" onClick={() => setActionModal({ isOpen: true, type: 'product', data: product })} style={{ marginRight: '8px' }}><Edit size={16}/></button>
                                <button className="btn btn-icon btn-danger" onClick={() => deleteItem('product', product.slug)}><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="animate-fade-in card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3>Manage Categories</h3>
                    <button className="btn btn-primary" onClick={() => setActionModal({ isOpen: true, type: 'category', data: null })} style={{ padding: '8px 16px' }}><Plus size={16}/> Add Category</button>
                  </div>
                  {categories.length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)' }}>No categories found.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-dim)' }}>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Slug</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map(cat => (
                            <tr key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{cat.name}</td>
                              <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{cat.slug}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button className="btn btn-icon btn-secondary" onClick={() => setActionModal({ isOpen: true, type: 'category', data: cat })} style={{ marginRight: '8px' }}><Edit size={16}/></button>
                                <button className="btn btn-icon btn-danger" onClick={() => deleteItem('categorie', cat.slug)}><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="animate-fade-in card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3>Manage Coupons</h3>
                    <button className="btn btn-primary" onClick={() => setActionModal({ isOpen: true, type: 'coupon', data: null })} style={{ padding: '8px 16px' }}><Plus size={16}/> Add Coupon</button>
                  </div>
                  {coupons.length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)' }}>No coupons found.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-dim)' }}>
                            <th style={{ padding: '12px' }}>Code</th>
                            <th style={{ padding: '12px' }}>Discount</th>
                            <th style={{ padding: '12px' }}>Valid Until</th>
                            <th style={{ padding: '12px' }}>Active</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coupons.map(coupon => (
                            <tr key={coupon.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{coupon.code}</td>
                              <td style={{ padding: '12px', color: 'var(--color-primary)' }}>₹{coupon.discount}</td>
                              <td style={{ padding: '12px' }}>{new Date(coupon.expiry).toLocaleDateString()}</td>
                              <td style={{ padding: '12px' }}>
                                <span className={`badge ${coupon.active ? 'badge-success' : 'badge-error'}`}>
                                  {coupon.active ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button className="btn btn-icon btn-secondary" onClick={() => setActionModal({ isOpen: true, type: 'coupon', data: coupon })} style={{ marginRight: '8px' }}><Edit size={16}/></button>
                                <button className="btn btn-icon btn-danger" onClick={() => deleteItem('coupon', coupon.code)}><Trash2 size={16}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="card animate-fade-in" style={{
            width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
            padding: '32px', position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--color-text-bright)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              Order Details <span style={{ color: 'var(--color-primary)' }}>#{selectedOrder.id}</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <h4 style={{ color: 'var(--color-text-dim)', marginBottom: '8px' }}>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.full_name}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`badge ${selectedOrder.status === 'Delivered' ? 'badge-success' : 'badge-error'}`} style={{ marginLeft: '8px' }}>
                    {selectedOrder.status}
                  </span>
                </p>
              </div>
              
              <div>
                <h4 style={{ color: 'var(--color-text-dim)', marginBottom: '8px' }}>Shipping Address</h4>
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

            <h4 style={{ color: 'var(--color-text-dim)', marginBottom: '16px' }}>Order Items</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '24px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--color-text-dim)' }}>
                  <th style={{ padding: '12px' }}>Product</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={item.product?.images?.[0]?.image_url || '/placeholder.png'} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                        <span>{item.product?.name || 'Unknown Product'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>₹{item.price}</td>
                    <td style={{ padding: '12px' }}>{item.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Grand Total:</span>
                  <span>₹{selectedOrder.total_amount}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary"
                onClick={() => handlePrintInvoice(selectedOrder.id)}
              >
                <Printer size={16} /> Print Full Invoice
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Action Modal (Add/Edit Category, Coupon, Product) */}
      {actionModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="card animate-fade-in" style={{
            width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
            padding: '32px', position: 'relative'
          }}>
            <button 
              onClick={() => setActionModal({ isOpen: false, type: null, data: null })}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--color-text-bright)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              {actionModal.data ? 'Edit' : 'Add'} {actionModal.type === 'category' ? 'Category' : actionModal.type === 'coupon' ? 'Coupon' : 'Product'}
            </h2>

            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {actionModal.type === 'category' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Category Name</label>
                    <input name="name" defaultValue={actionModal.data?.name || ''} className="form-input" required />
                  </div>
                </>
              )}
              {actionModal.type === 'coupon' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Coupon Code</label>
                    <input name="code" defaultValue={actionModal.data?.code || ''} className="form-input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Discount Amount (₹)</label>
                    <input type="number" name="discount" defaultValue={actionModal.data?.discount || ''} className="form-input" required min="1" step="0.01" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Minimum Order Amount (₹)</label>
                    <input type="number" name="minimum_amount" defaultValue={actionModal.data?.minimum_amount || '0'} className="form-input" required min="0" step="0.01" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Expiry Date</label>
                    <input type="datetime-local" name="expiry" defaultValue={actionModal.data ? new Date(actionModal.data.expiry).toISOString().slice(0, 16) : ''} className="form-input" required />
                  </div>
                </>
              )}
              {actionModal.type === 'product' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Product Name</label>
                    <input name="name" defaultValue={actionModal.data?.name || ''} className="form-input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Price (₹)</label>
                    <input type="number" step="0.01" name="price" defaultValue={actionModal.data?.price || ''} className="form-input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Stock Quantity</label>
                    <input type="number" name="quantity" defaultValue={actionModal.data?.quantity || actionModal.data?.stock || ''} className="form-input" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Category</label>
                    <select name="category" defaultValue={actionModal.data?.category?.id || ''} className="form-input" required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Short Description</label>
                    <textarea name="short_description" defaultValue={actionModal.data?.short_description || ''} className="form-input" rows="2" required></textarea>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-dim)' }}>Product Images</label>
                    <input type="file" name="uploaded_images" multiple accept="image/*" className="form-input" />
                  </div>
                </>
              )}

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setActionModal({ isOpen: false, type: null, data: null })}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? 'var(--color-primary)' : 'var(--color-success)',
          color: '#fff',
          padding: '14px 28px',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          fontSize: '15px',
          fontWeight: '500',
          animation: 'fade-in 0.3s ease'
        }}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
