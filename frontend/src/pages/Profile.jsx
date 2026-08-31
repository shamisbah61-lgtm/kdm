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
        <aside className="bg-[#FBFBFD] border border-[#EAEAEA]/60 rounded-3xl p-8 text-center h-fit lg:sticky lg:top-[120px]">
          <div className="w-[120px] h-[120px] rounded-full mx-auto mb-5 overflow-hidden shadow-sm bg-white border border-[#EAEAEA] relative group">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-[#1D1D1F]">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-[20px] font-semibold text-[#1D1D1F] mb-1">{user?.first_name} {user?.last_name}</h2>
          <p className="text-[14px] text-[#86868B] mb-8 font-medium truncate">{user?.email}</p>

          <nav className="flex flex-col gap-2">
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-[14px] font-medium p-3 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === 'orders' ? 'text-[#1D1D1F] bg-white shadow-sm' : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]'}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={18} /> Order History
            </button>
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-[14px] font-medium p-3 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === 'addresses' ? 'text-[#1D1D1F] bg-white shadow-sm' : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]'}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={18} /> Addresses
            </button>
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-[14px] font-medium p-3 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === 'settings' ? 'text-[#1D1D1F] bg-white shadow-sm' : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Edit Profile
            </button>
            <button
              className={`flex items-center gap-3 w-full text-left bg-transparent border-none text-[14px] font-medium p-3 rounded-2xl cursor-pointer transition-all duration-300 ${activeTab === 'security' ? 'text-[#1D1D1F] bg-white shadow-sm' : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]'}`}
              onClick={() => setActiveTab('security')}
            >
              <Key size={18} /> Password & Security
            </button>
          </nav>
        </aside>

        {/* Content Box */}
        <main className="bg-white border border-[#EAEAEA] rounded-3xl p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.02)] min-h-[500px]">
          
          {/* 1. Orders Tab */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-6 border-b border-[#F5F5F7] pb-4 flex items-center gap-3 tracking-tight">
                <ClipboardList className="text-[#1D1D1F]" /> My Order History
              </h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-16 px-6 bg-[#FBFBFD] rounded-2xl border border-[#EAEAEA]">
                  <Package size={32} className="text-[#86868B] mx-auto mb-4" />
                  <p className="text-[17px] font-medium text-[#1D1D1F] mb-2">No Orders Yet</p>
                  <p className="text-[14px] text-[#86868B]">You haven't placed any orders with us yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#F5F5F7]">
                        <th className="text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider pb-4 pl-2">Order ID</th>
                        <th className="text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider pb-4">Date</th>
                        <th className="text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider pb-4">Status</th>
                        <th className="text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider pb-4">Total</th>
                        <th className="text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider pb-4">Payment</th>
                        <th className="text-right text-[12px] font-semibold text-[#86868B] uppercase tracking-wider pb-4 pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id} className="border-b border-[#F5F5F7] hover:bg-[#FBFBFD] transition-colors">
                          <td className="py-4 pl-2 text-[14px] text-[#1D1D1F] font-medium">{ord.order_number}</td>
                          <td className="py-4 text-[14px] text-[#86868B]">{new Date(ord.created_at).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide ${ord.status === 'Cancelled' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : ord.status === 'Pending' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#34C759]/10 text-[#34C759]'}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 font-semibold text-[#1D1D1F]">₹{ord.final_amount}</td>
                          <td className="py-4 text-[13px] font-medium text-[#86868B]">
                            {ord.payment_method.toUpperCase()} <span className="opacity-60">({ord.payment_status})</span>
                          </td>
                          <td className="py-4 pr-2 text-right">
                            {ord.status === 'Pending' && (
                              <button className="bg-white hover:bg-[#FBFBFD] border border-[#EAEAEA] text-[#FF3B30] hover:border-[#FF3B30] px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors" onClick={() => handleCancelOrder(ord.id)}>
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
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-6 border-b border-[#F5F5F7] pb-4 flex items-center gap-3 tracking-tight">
                <MapPin className="text-[#1D1D1F]" /> Shipping Addresses
              </h2>
              
              {addresses.length === 0 ? (
                <div className="text-center py-16 px-6 bg-[#FBFBFD] rounded-2xl border border-[#EAEAEA]">
                  <MapPin size={32} className="text-[#86868B] mx-auto mb-4" />
                  <p className="text-[17px] font-medium text-[#1D1D1F] mb-2">No Addresses Saved</p>
                  <p className="text-[14px] text-[#86868B]">Your saved shipping addresses will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-[#FBFBFD] border border-[#EAEAEA] rounded-2xl p-6 relative group hover:border-[#1D1D1F]/20 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-[16px] font-semibold text-[#1D1D1F] m-0">{addr.name}</h4>
                        <div className="flex gap-2">
                          {addr.default && <span className="bg-[#1D1D1F] text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">Default</span>}
                          <button className="bg-transparent border-none text-[#86868B] hover:text-[#FF3B30] cursor-pointer p-0 transition-colors" onClick={() => handleDeleteAddress(addr.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[14px] text-[#86868B] mb-3 leading-relaxed">
                        {addr.address}<br />
                        {addr.city}, {addr.state} - {addr.zipcode}
                      </p>
                      <p className="text-[13px] font-medium text-[#1D1D1F] flex items-center gap-1.5"><Key size={12} className="text-[#86868B]" /> {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Settings Tab */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-6 border-b border-[#F5F5F7] pb-4 flex items-center gap-3 tracking-tight">
                <Settings className="text-[#1D1D1F]" /> Account Settings
              </h2>
              
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
                {profileError && (
                  <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] px-4 py-3 rounded-2xl text-[14px] font-medium flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{profileError}</p>
                  </div>
                )}
                {profileSuccess && (
                  <div className="bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] px-4 py-3 rounded-2xl text-[14px] font-medium flex items-start gap-2">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{profileSuccess}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">First Name</label>
                    <input type="text" className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Last Name</label>
                    <input type="text" className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Phone Number</label>
                  <input type="text" className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Profile Avatar</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-[#EAEAEA] overflow-hidden shrink-0 bg-[#FBFBFD]">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-[#86868B]">?</div>
                      )}
                    </div>
                    <label className="bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors cursor-pointer flex items-center gap-2">
                      <Camera size={16} /> Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <button type="submit" className="w-full sm:w-auto bg-[#1D1D1F] hover:bg-[#333333] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all active:scale-95 self-start mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* 4. Security Tab */}
          {activeTab === 'security' && (
            <div className="animate-fade-in max-w-lg">
              <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-6 border-b border-[#F5F5F7] pb-4 flex items-center gap-3 tracking-tight">
                <Key className="text-[#1D1D1F]" /> Password & Security
              </h2>
              
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
                {passError && (
                  <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] px-4 py-3 rounded-2xl text-[14px] font-medium flex items-start gap-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{passError}</p>
                  </div>
                )}
                {passSuccess && (
                  <div className="bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] px-4 py-3 rounded-2xl text-[14px] font-medium flex items-start gap-2">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> <p className="m-0">{passSuccess}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Current Password</label>
                  <input type="password" className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">New Password</label>
                  <input type="password" className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">Confirm New Password</label>
                  <input type="password" className="form-input bg-[#FBFBFD] border-[#EAEAEA] font-medium" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} required />
                </div>

                <button type="submit" className="w-full sm:w-auto bg-[#1D1D1F] hover:bg-[#333333] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all active:scale-95 self-start mt-4">
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
