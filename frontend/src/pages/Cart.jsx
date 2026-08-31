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
        <div className="text-center py-20 px-10 bg-[var(--alt-bg)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] w-full max-w-2xl shadow-inner">
          <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-color)] shadow-sm">
            <ShoppingBag size={40} className="text-[var(--color-text-dim)]" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-[var(--color-text-bright)]">Your Cart is Empty</h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-md mx-auto">Looks like you haven't added any premium upgrades to your cart yet.</p>
          <Link to="/products" className="btn btn-primary">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in pb-24 pt-10">
      <div className="flex items-end justify-between mb-10 border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-bright)] tracking-tight m-0">Shopping Cart</h1>
          <p className="text-[var(--color-text-dim)] mt-2 font-medium">Review your items and proceed to checkout.</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-2xl font-black text-[var(--color-text-bright)]">{cartItems.length}</span>
          <span className="text-sm font-bold text-[var(--color-text-dim)] uppercase tracking-wider ml-2">Items</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-12">
        <div className="flex flex-col gap-6">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md group">
              <Link to={`/products/${item.product?.slug}`} className="w-full max-w-[200px] h-[200px] md:w-[140px] md:min-w-[140px] md:h-[140px] bg-gradient-to-br from-[var(--alt-bg)] to-[var(--bg-card)] rounded-[var(--border-radius-md)] border border-[var(--border-color)] p-4 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[var(--color-primary)] transition-colors">
                <img src={item.product?.thumbnail || item.product?.images?.[0]?.image || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-lg" />
              </Link>
              
              <div className="flex-1 flex flex-col w-full h-full">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <Link to={`/products/${item.product?.slug}`} className="text-xl font-bold text-[var(--color-text-bright)] no-underline line-clamp-2 hover:text-[var(--color-primary)] transition-colors leading-snug">{item.product?.name}</Link>
                  <div className="text-xl font-black text-[var(--color-primary)] shrink-0">
                    ₹{item.subtotal || ((item.product?.discount_price || item.product?.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
                
                <span className="text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-6 block">{item.product?.category_name}</span>
                
                <div className="mt-auto flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 border-t border-[var(--border-color)] pt-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center border-2 border-[var(--border-color)] rounded-full bg-[var(--bg-card)] h-[44px] overflow-hidden">
                      <button onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)} className="w-10 h-full bg-transparent border-none text-[var(--color-text-bright)] cursor-pointer hover:bg-[var(--alt-bg)] transition-colors font-bold">-</button>
                      <span className="font-bold text-[15px] px-3">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-full bg-transparent border-none text-[var(--color-text-bright)] cursor-pointer hover:bg-[var(--alt-bg)] transition-colors font-bold">+</button>
                    </div>
                  </div>
                  
                  <button onClick={() => removeFromCart(item.id)} className="bg-transparent border-none text-[var(--color-text-dim)] hover:text-red-500 cursor-pointer flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider transition-colors">
                    <Trash2 size={16} /> <span className="sm:hidden md:inline">Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-b from-[var(--bg-card)] to-[var(--alt-bg)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-8 h-fit shadow-xl lg:sticky lg:top-[120px]">
          <h3 className="text-2xl font-black mb-6 text-[var(--color-text-bright)] flex items-center gap-2"><CreditCard size={24} className="text-[var(--color-primary)]"/> Order Summary</h3>
          
          <div className="flex justify-between mb-4 text-[var(--color-text-muted)] font-medium">
            <span>Subtotal ({cartItems.length} items)</span>
            <span className="text-[var(--color-text-bright)] font-bold">₹{totalPrice}</span>
          </div>
          
          <div className="flex justify-between mb-6 text-[var(--color-text-muted)] font-medium">
            <span>Shipping</span>
            <span className="text-sm italic">Calculated at checkout</span>
          </div>
          
          <div className="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h4 className="mb-3 text-[13px] font-bold text-[var(--color-text-bright)] uppercase tracking-wider flex items-center gap-2"><Ticket size={16} /> Promo Code</h4>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                className="form-input flex-1 !rounded-full !py-3" 
                placeholder="Enter Code" 
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
              />
              <button className="btn btn-secondary shrink-0" onClick={() => handleApplyCoupon(couponInput)}>
                Apply
              </button>
            </div>
            
            {couponError && <p className="text-red-500 font-medium text-[13px] mt-3 flex items-center gap-1"><ShieldCheck size={14}/> {couponError.code || couponError}</p>}
            
            {appliedCoupon && !couponError && (
              <div className="flex justify-between items-center mt-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <span className="text-emerald-500 font-bold text-[13px]">Code '{appliedCoupon.code}' applied!</span>
                <div className="flex items-center gap-3">
                  <span className="font-black text-emerald-500">-₹{appliedCoupon.discount}</span>
                  <button onClick={() => setAppliedCoupon(null)} className="bg-transparent border-none text-emerald-500 hover:text-red-500 cursor-pointer p-1 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mb-8 text-2xl font-black text-[var(--color-text-bright)]">
            <span>Total</span>
            <span className="text-[var(--color-primary)]">
              ₹{appliedCoupon ? (parseFloat(totalPrice) - parseFloat(appliedCoupon.discount)).toFixed(2) : totalPrice}
            </span>
          </div>

          <button className="btn btn-primary w-full flex justify-center gap-3 items-center mb-4" onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}>
            Checkout Securely <ArrowRight size={20} />
          </button>
          
          <div className="text-center text-[11px] text-[var(--color-text-dim)] font-medium uppercase tracking-widest">
            Taxes & shipping calculated at checkout
          </div>
        </div>
      </div>
    </div>
  );
}
