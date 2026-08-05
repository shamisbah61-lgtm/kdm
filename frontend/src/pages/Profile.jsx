import { useContext, useEffect, useState } from 'react';
import { Award, ShieldCheck, MapPin, ClipboardList, Key, Settings, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { apiRequest } from '../utils/api';

export default function Profile() {
  const { user, updateProfile, changePassword } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('orders');

  // Profile Edit fields
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImageFile, setProfileImageFile] = useState(null);

  // Sync form inputs when user profile loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);
  
  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // Lists
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  // Feedback Banners
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, []);

  const fetchOrders = async () => {
    const res = await apiRequest('/orders/');
    if (res.success) {
      setOrders(res.data.results || res.data || []);
    }
  };

  const fetchAddresses = async () => {
    const res = await apiRequest('/orders/addresses/');
    if (res.success) {
      setAddresses(res.data.results || res.data || []);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('phone', phone);
    if (profileImageFile) {
      formData.append('profile_image', profileImageFile);
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setProfileSuccess('Profile details updated successfully!');
    } else {
      setProfileError(res.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== newPasswordConfirm) {
      setPassError('New passwords do not match.');
      return;
    }

    const res = await changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });

    if (res.success) {
      setPassSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } else {
      setPassError(res.message || 'Failed to change password.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const res = await apiRequest(`/orders/${orderId}/cancel/`, {
      method: 'POST',
    });
    if (res.success) {
      alert('Order cancelled and inventory restored!');
      fetchOrders();
    } else {
      alert(res.message || 'Failed to cancel order.');
    }
  };



  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Delete this address?')) return;
    const res = await apiRequest(`/orders/addresses/${addrId}/`, {
      method: 'DELETE',
    });
    if (res.success) {
      fetchAddresses();
    }
  };

  return (
    <div className="container animate-fade-in">
      <div className="profile-layout">
        
        {/* Sidebar Profile Card */}
        <aside className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            <img
              src={user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
              alt="Avatar"
              className="profile-avatar-img"
            />
          </div>
          <h2 className="profile-sidebar-name">{user?.first_name} {user?.last_name}</h2>
          <p className="profile-sidebar-email">{user?.email}</p>

          <nav className="profile-menu">
            <button
              className={`profile-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={16} /> Order History
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={16} /> Addresses
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} /> Edit Profile
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Key size={16} /> Password & Security
            </button>
          </nav>
        </aside>

        {/* Content Box */}
        <main className="profile-content-box">
          
          {/* 1. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-pane">
              <h2>My Order History</h2>
              
              {orders.length === 0 ? (
                <p className="empty-tab-text">You have not placed any orders yet.</p>
              ) : (
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="ord-number">{ord.order_number}</td>
                          <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${ord.status === 'Cancelled' ? 'badge-error' : 'badge-success'}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>₹{ord.final_amount}</td>
                          <td>
                            <span className="payment-lbl-status">{ord.payment_method.toUpperCase()} ({ord.payment_status})</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {ord.status === 'Pending' && (
                                <button className="btn-cancel-ord" onClick={() => handleCancelOrder(ord.id)}>
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="tab-pane">
              <h2>Shipping Addresses</h2>
              
              {addresses.length === 0 ? (
                <p className="empty-tab-text">No shipping addresses saved.</p>
              ) : (
                <div className="addresses-grid">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="address-profile-card">
                      <div className="address-header">
                        <h4>{addr.name}</h4>
                        <div className="address-badge-actions">
                          {addr.default && <span className="badge badge-success default-badge">Default</span>}
                          <button className="btn-delete-addr" onClick={() => handleDeleteAddress(addr.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="addr-details-text">
                        {addr.address}, {addr.city}, {addr.state} - {addr.zipcode}
                      </p>
                      <p className="addr-phone">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-pane">
              <h2>Account Settings</h2>
              <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                {profileError && <div className="error-banner">{profileError}</div>}
                {profileSuccess && <div className="success-banner">{profileSuccess}</div>}

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Avatar Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={(e) => setProfileImageFile(e.target.files[0])}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ color: '#000' }}>
                  Save Profile Info
                </button>
              </form>
            </div>
          )}

          {/* 4. Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-pane">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="security-form">
                {passError && <div className="error-banner">{passError}</div>}
                {passSuccess && <div className="success-banner">{passSuccess}</div>}

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ color: '#000' }}>
                  Update Password
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      <style>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
        }
        @media (max-width: 768px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
        }
        .profile-sidebar-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 32px 24px;
          text-align: center;
          height: fit-content;
        }
        .profile-avatar-wrapper {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
          overflow: hidden;
          margin: 0 auto 20px auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .profile-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-sidebar-name {
          font-size: 20px;
          margin-bottom: 4px;
        }
        .profile-sidebar-email {
          font-size: 13px;
          color: var(--color-text-dim);
          margin-bottom: 30px;
        }
        .profile-menu {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }
        .profile-menu-item {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-text-muted);
          font-size: 14px;
          padding: 12px 16px;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .profile-menu-item:hover, .profile-menu-item.active {
          background: rgba(212,175,55,0.08);
          color: var(--color-primary);
        }
        .profile-content-box {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 40px;
        }
        .profile-content-box h2 {
          font-size: 22px;
          margin-bottom: 30px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }
        .empty-tab-text {
          color: var(--color-text-dim);
          font-style: italic;
        }
        .orders-table-wrapper {
          overflow-x: auto;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }
        .orders-table th {
          border-bottom: 1px solid var(--border-color);
          padding: 12px 16px;
          color: var(--color-text-bright);
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
        .orders-table td {
          padding: 16px;
          border-bottom: 1px dashed rgba(0,0,0,0.05);
          color: var(--color-text-muted);
        }
        .ord-number {
          font-family: monospace;
          color: var(--color-text-bright);
          font-weight: 600;
        }
        .payment-lbl-status {
          font-size: 12px;
          color: var(--color-text-dim);
        }
        .btn-cancel-ord {
          background: none;
          border: 1px solid rgba(219, 68, 55, 0.3);
          color: var(--color-error);
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: var(--transition-smooth);
        }
        .btn-cancel-ord:hover {
          background: rgba(219, 68, 55, 0.1);
        }

        .addresses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 576px) {
          .addresses-grid {
            grid-template-columns: 1fr;
          }
        }
        .address-profile-card {
          border: 1px solid var(--border-color);
          background: var(--alt-bg);
          border-radius: var(--border-radius-md);
          padding: 20px;
        }
        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .address-badge-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .default-badge {
          font-size: 8px;
          padding: 2px 6px;
        }
        .btn-delete-addr {
          background: none;
          border: none;
          color: var(--color-text-dim);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-delete-addr:hover {
          color: var(--color-error);
        }
        .addr-details-text {
          font-size: 13px;
          margin-bottom: 8px;
          color: var(--color-text-muted);
        }
        .addr-phone {
          font-size: 12px;
          color: var(--color-text-dim);
        }
        .form-group-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .profile-edit-form, .security-form {
          max-width: 540px;
        }
      `}</style>
    </div>
  );
}
