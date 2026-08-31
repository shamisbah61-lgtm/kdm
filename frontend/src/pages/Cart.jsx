import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Ticket, ShieldCheck, CreditCard } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, totalPrice, loading } = useContext(CartContext);
  const navigate = useNavigate();

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (code) => {
    if (!code) return;
    setCouponError('');
    const res = await apiRequest('/coupons/validate/', {
      method: 'POST',
      body: { code, order_total: parseFloat(totalPrice) }
    });
    
    if (res.success) {
      setAppliedCoupon(res.data);
      setCouponInput('');
    } else {
      setCouponError(res.message || 'Invalid or inapplicable coupon code.');
      setAppliedCoupon(null);
    }
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-[var(--color-text-muted)] pt-10">
      <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest uppercase text-sm">Loading your cart...</p>
    </div>
  );

  const cartItems = cart?.items || [];

  if (cartItems.length === 0) {
    return (
      <div className="container min-h-[70vh] flex items-center justify-center pt-10">
        <div className="text-center py-24 px-10 bg-[#FBFBFD] rounded-[32px] border border-[#EAEAEA] w-full max-w-2xl">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <ShoppingBag size={32} className="text-[#86868B]" />
          </div>
          <h2 className="text-3xl font-semibold mb-4 text-[#1D1D1F] tracking-tight">Your Cart is Empty</h2>
          <p className="text-[17px] text-[#86868B] mb-10 max-w-md mx-auto leading-relaxed">Looks like you haven't added any premium upgrades to your cart yet.</p>
          <Link to="/products" className="inline-flex items-center justify-center bg-[#1D1D1F] text-white px-8 py-3 rounded-full font-medium transition-all hover:bg-[#333333] active:scale-95">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in pb-24 pt-10">
      <div className="flex items-end justify-between mb-10 border-b border-[#F5F5F7] pb-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold text-[#1D1D1F] tracking-tight m-0">Shopping Cart</h1>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <span className="text-2xl font-semibold text-[#1D1D1F]">{cartItems.length}</span>
          <span className="text-[12px] font-medium text-[#86868B] uppercase tracking-wider">Items</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-12">
        <div className="flex flex-col gap-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white border border-[#F5F5F7] rounded-3xl p-5 flex flex-col md:flex-row items-center md:items-start gap-6 transition-all hover:border-[#EAEAEA] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] group">
              <Link to={`/products/${item.product?.slug}`} className="w-full max-w-[200px] h-[200px] md:w-[140px] md:min-w-[140px] md:h-[140px] bg-[#FBFBFD] rounded-2xl p-4 flex items-center justify-center shrink-0 overflow-hidden transition-colors">
                <img src={item.product?.thumbnail || item.product?.images?.[0]?.image || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]" />
              </Link>
              
              <div className="flex-1 flex flex-col w-full h-full justify-center">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <Link to={`/products/${item.product?.slug}`} className="text-[17px] font-semibold text-[#1D1D1F] no-underline line-clamp-2 leading-snug">{item.product?.name}</Link>
                  <div className="text-[17px] font-semibold text-[#1D1D1F] shrink-0">
                    ₹{item.subtotal || ((item.product?.discount_price || item.product?.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
                
                <span className="text-[12px] font-medium text-[#86868B] mb-6 block">{item.product?.category_name}</span>
                
                <div className="mt-auto flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 border-t border-[#F5F5F7] pt-5">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center justify-between border border-[#EAEAEA] rounded-full bg-white h-[44px] overflow-hidden px-1">
                      <button onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)} className="w-9 h-9 bg-transparent border-none text-[#1D1D1F] cursor-pointer hover:bg-[#F5F5F7] rounded-full transition-colors font-medium">-</button>
                      <span className="font-semibold text-[15px] px-3">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-9 h-9 bg-transparent border-none text-[#1D1D1F] cursor-pointer hover:bg-[#F5F5F7] rounded-full transition-colors font-medium">+</button>
                    </div>
                  </div>
                  
                  <button onClick={() => removeFromCart(item.id)} className="bg-transparent border-none text-[#86868B] hover:text-[#E83422] cursor-pointer flex items-center gap-1.5 text-[13px] font-medium transition-colors">
                    <Trash2 size={16} /> <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-[#FBFBFD] border border-[#EAEAEA]/60 rounded-3xl p-8 h-fit lg:sticky lg:top-[120px]">
          <h3 className="text-2xl font-semibold mb-6 text-[#1D1D1F] tracking-tight">Order Summary</h3>
          
          <div className="flex justify-between mb-4 text-[#86868B] text-[15px]">
            <span>Subtotal</span>
            <span className="text-[#1D1D1F] font-medium">₹{totalPrice}</span>
          </div>
          
          <div className="flex justify-between mb-6 text-[#86868B] text-[15px]">
            <span>Shipping</span>
            <span className="text-[#1D1D1F] font-medium">Calculated at checkout</span>
          </div>
          
          <div className="mb-6 pb-6 border-b border-[#F5F5F7]">
            <h4 className="mb-3 text-[13px] font-semibold text-[#1D1D1F] flex items-center gap-2">Promo Code</h4>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-white border border-[#EAEAEA] rounded-full px-4 text-[14px] outline-none focus:border-[#1D1D1F] transition-colors" 
                placeholder="Enter Code" 
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
              />
              <button className="bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] px-5 py-2.5 rounded-full text-[14px] font-medium transition-colors shrink-0" onClick={() => handleApplyCoupon(couponInput)}>
                Apply
              </button>
            </div>
            
            {couponError && <p className="text-[#E83422] font-medium text-[13px] mt-3 flex items-center gap-1"><ShieldCheck size={14}/> {couponError.code || couponError}</p>}
            
            {appliedCoupon && !couponError && (
              <div className="flex justify-between items-center mt-3 bg-[#34C759]/10 p-3 rounded-2xl">
                <span className="text-[#34C759] font-medium text-[13px]">Code '{appliedCoupon.code}' applied!</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#34C759]">-₹{appliedCoupon.discount}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-[#34C759] hover:text-[#1D1D1F] transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mb-8 text-2xl font-semibold text-[#1D1D1F] tracking-tight">
            <span>Total</span>
            <span>
              ₹{appliedCoupon ? (parseFloat(totalPrice) - parseFloat(appliedCoupon.discount)).toFixed(2) : totalPrice}
            </span>
          </div>

          <button className="w-full bg-[#1D1D1F] hover:bg-[#333333] text-white py-4 rounded-full text-[15px] font-semibold transition-all active:scale-95 flex justify-center items-center gap-2 mb-4" onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}>
            Checkout Securely
          </button>
          
          <div className="text-center text-[12px] text-[#86868B]">
            Taxes & shipping calculated at checkout
          </div>
        </div>
      </div>
    </div>
  );
}
