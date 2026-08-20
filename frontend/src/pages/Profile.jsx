import { useContext, useEffect, useState } from 'react';
import { Award, ShieldCheck, MapPin, ClipboardList, Key, Settings, Trash2, Camera, AlertCircle, CheckCircle2, Package } from 'lucide-react';
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
  const [imagePreview, setImagePreview] = useState(user?.profile_image || '');

  // Sync form inputs when user profile loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
      setImagePreview(user.profile_image || '');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
    <div className="container animate-fade-in pt-10 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
        
        {/* Sidebar Profile Card */}
        <aside className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-8 text-center h-fit lg:sticky lg:top-[120px] shadow-xl">
          <div className="w-[120px] h-[120px] rounded-full border-4 border-[var(--color-primary)] mx-auto mb-5 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] bg-[var(--alt-bg)] relative group">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-[var(--color-primary)]">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-bright)] mb-1">{user?.first_name} {user?.last_name}</h2>
          <p className="text-sm text-[var(--color-text-dim)] mb-8 font-medium truncate">{user?.email}</p>

          <nav className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-sm font-semibold p-3 rounded-lg cursor-pointer transition-all duration-300 ${activeTab === 'orders' ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] hover:bg-[var(--alt-bg)] hover:text-[var(--color-text-bright)]'}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={18} /> Order History
            </button>
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-sm font-semibold p-3 rounded-lg cursor-pointer transition-all duration-300 ${activeTab === 'addresses' ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] hover:bg-[var(--alt-bg)] hover:text-[var(--color-text-bright)]'}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={18} /> Addresses
            </button>
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-sm font-semibold p-3 rounded-lg cursor-pointer transition-all duration-300 ${activeTab === 'settings' ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] hover:bg-[var(--alt-bg)] hover:text-[var(--color-text-bright)]'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Edit Profile
            </button>
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-sm font-semibold p-3 rounded-lg cursor-pointer transition-all duration-300 ${activeTab === 'security' ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)] hover:bg-[var(--alt-bg)] hover:text-[var(--color-text-bright)]'}`}
              onClick={() => setActiveTab('security')}
            >
              <Key size={18} /> Password & Security
            </button>
          </nav>
        </aside>

        {/* Content Box */}
        <main className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-8 md:p-10 shadow-xl min-h-[500px]">
          
          {/* 1. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-[var(--color-text-bright)] mb-6 border-b border-[var(--border-color)] pb-4 flex items-center gap-3">
                <ClipboardList className="text-[var(--color-primary)]" /> My Order History
              </h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-16 px-6 bg-[var(--alt-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
                  <Package size={40} className="text-[var(--color-text-dim)] mx-auto mb-4" />
                  <p className="text-lg font-bold text-[var(--color-text-bright)] mb-2">No Orders Yet</p>
                  <p className="text-[var(--color-text-muted)]">You haven't placed any orders with us yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[var(--border-color)]">
                        <th className="text-left text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-widest pb-4 pl-2">Order ID</th>
                        <th className="text-left text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-widest pb-4">Date</th>
                        <th className="text-left text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-widest pb-4">Status</th>
                        <th className="text-left text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-widest pb-4">Total</th>
                        <th className="text-left text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-widest pb-4">Payment</th>
                        <th className="text-right text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-widest pb-4 pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id} className="border-b border-[var(--border-color)] hover:bg-[var(--alt-bg)] transition-colors">
                          <td className="py-4 pl-2 font-mono text-[13px] text-[var(--color-text-bright)] font-semibold">{ord.order_number}</td>
                          <td className="py-4 text-sm text-[var(--color-text-muted)]">{new Date(ord.created_at).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ord.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ord.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-[var(--color-text-bright)]">₹{ord.final_amount}</td>
                          <td className="py-4 text-xs font-semibold text-[var(--color-text-muted)]">
                            {ord.payment_method.toUpperCase()} <span className="opacity-60">({ord.payment_status})</span>
                          </td>
                          <td className="py-4 pr-2 text-right">
                            {ord.status === 'Pending' && (
                              <button className="bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-500 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-colors" onClick={() => handleCancelOrder(ord.id)}>
                                Cancel
                              </button>
                            )}
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
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-[var(--color-text-bright)] mb-6 border-b border-[var(--border-color)] pb-4 flex items-center gap-3">
                <MapPin className="text-[var(--color-primary)]" /> Shipping Addresses
              </h2>
              
              {addresses.length === 0 ? (
                <div className="text-center py-16 px-6 bg-[var(--alt-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
                  <MapPin size={40} className="text-[var(--color-text-dim)] mx-auto mb-4" />
                  <p className="text-lg font-bold text-[var(--color-text-bright)] mb-2">No Addresses Saved</p>
                  <p className="text-[var(--color-text-muted)]">Your saved shipping addresses will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-[var(--alt-bg)] border border-[var(--border-color)] rounded-xl p-6 relative group hover:border-[var(--color-primary)] transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-[15px] font-bold text-[var(--color-text-bright)] m-0">{addr.name}</h4>
                        <div className="flex gap-2">
                          {addr.default && <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Default</span>}
                          <button className="bg-transparent border-none text-[var(--color-text-dim)] hover:text-red-500 cursor-pointer p-0 transition-colors" onClick={() => handleDeleteAddress(addr.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)] mb-2 leading-relaxed">
                        {addr.address}<br />
                        {addr.city}, {addr.state} - {addr.zipcode}
                      </p>
                      <p className="text-xs font-semibold text-[var(--color-text-dim)] flex items-center gap-1.5"><Key size={12}/> {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Settings Tab */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl">
              <h2 className="text-2xl font-black text-[var(--color-text-bright)] mb-6 border-b border-[var(--border-color)] pb-4 flex items-center gap-3">
                <Settings className="text-[var(--color-primary)]" /> Account Settings
              </h2>
              
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
                {profileError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{profileError}</p>
                  </div>
                )}
                {profileSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{profileSuccess}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">First Name</label>
                    <input type="text" className="form-input border-2 font-medium bg-[var(--bg-card)]" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Last Name</label>
                    <input type="text" className="form-input border-2 font-medium bg-[var(--bg-card)]" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="text" className="form-input border-2 font-medium bg-[var(--bg-card)]" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Profile Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-[var(--border-color)] overflow-hidden shrink-0 bg-[var(--alt-bg)]">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[var(--color-text-dim)]">?</div>
                      )}
                    </div>
                    <label className="btn btn-secondary cursor-pointer text-sm font-semibold flex items-center gap-2">
                      <Camera size={16} /> Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full sm:w-auto self-start mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* 4. Security Tab */}
          {activeTab === 'security' && (
            <div className="animate-fade-in max-w-lg">
              <h2 className="text-2xl font-black text-[var(--color-text-bright)] mb-6 border-b border-[var(--border-color)] pb-4 flex items-center gap-3">
                <Key className="text-[var(--color-primary)]" /> Password & Security
              </h2>
              
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
                {passError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{passError}</p>
                  </div>
                )}
                {passSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{passSuccess}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Current Password</label>
                  <input type="password" className="form-input border-2 font-medium bg-[var(--bg-card)]" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">New Password</label>
                  <input type="password" className="form-input border-2 font-medium bg-[var(--bg-card)]" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-2">Confirm New Password</label>
                  <input type="password" className="form-input border-2 font-medium bg-[var(--bg-card)]" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary w-full sm:w-auto self-start mt-4">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
