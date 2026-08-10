import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="container loading-state">Loading cart...</div>;

  const cartItems = cart?.items || [];

  if (cartItems.length === 0) {
    return (
      <div className="container empty-state py-20 px-6 text-center bg-[var(--alt-bg)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] mt-10">
        <ShoppingBag size={48} className="text-[var(--color-text-dim)] mb-4 mx-auto" />
        <h2 className="mb-2">Your Cart is Empty</h2>
        <p className="text-[var(--color-text-muted)]">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary mt-6 inline-block">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in pb-20 mt-10">
      <h1 className="mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-10">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="card flex flex-col md:flex-row items-center gap-5 p-5 mb-5 text-center md:text-left">
              <div className="w-full max-w-[200px] h-[200px] md:w-[120px] md:min-w-[120px] md:h-[120px] shrink-0 bg-[var(--alt-bg)] flex items-center justify-center rounded-[var(--border-radius-md)] border border-[var(--border-color)] overflow-hidden">
                <img src={item.product?.thumbnail || item.product?.images?.[0]?.image || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 flex flex-col w-full">
                <Link to={`/products/${item.product?.slug}`} className="text-lg font-bold text-[var(--color-text-bright)] no-underline line-clamp-2">{item.product?.name}</Link>
                <span className="text-[var(--color-text-dim)] text-[13px] uppercase mb-3">{item.product?.category_name}</span>
                <div className="mt-auto flex flex-col md:flex-row justify-center md:justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                    <div className="flex items-center border border-[var(--border-color)] rounded-[var(--border-radius-md)] bg-[var(--bg-card)]">
                      <button onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 bg-transparent border-none text-[var(--color-text-bright)] cursor-pointer">-</button>
                      <span className="font-bold px-2">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 bg-transparent border-none text-[var(--color-text-bright)] cursor-pointer">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="bg-transparent border-none text-[var(--color-error)] cursor-pointer flex items-center gap-1 text-[13px]">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                  <div className="text-lg font-bold text-[var(--color-primary)]">
                    ₹{item.subtotal || ((item.product?.discount_price || item.product?.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary card p-6 h-fit">
          <h3 className="mb-6">Order Summary</h3>
          <div className="flex justify-between mb-4 text-[var(--color-text-muted)]">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="flex justify-between mb-4 text-[var(--color-text-muted)]">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between mb-6 pt-4 border-t border-[var(--border-color)] text-[20px] font-bold text-[var(--color-text-bright)]">
            <span>Total</span>
            <span className="text-[var(--color-primary)]">₹{appliedCoupon ? (parseFloat(totalPrice) - parseFloat(appliedCoupon.discount)).toFixed(2) : totalPrice}</span>
          </div>

          <div className="mb-6 pt-4 border-t border-[var(--border-color)]">
            <h4 className="mb-3 text-[14px] text-[var(--color-text-bright)]">Promo Code</h4>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                className="form-input px-3 py-2" 
                placeholder="Enter Code" 
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
              />
              <button className="btn btn-primary px-4 py-2 text-black" onClick={() => handleApplyCoupon(couponInput)}>
                Apply
              </button>
            </div>
            {couponError && <p className="text-[var(--color-error)] text-[12px] mt-2">{couponError.code || couponError}</p>}
            {appliedCoupon && !couponError && (
              <div className="flex justify-between items-center mt-2 bg-[rgba(21,128,61,0.1)] p-2 rounded">
                <span className="text-[var(--color-success)] text-[13px]">Coupon '{appliedCoupon.code}' applied! (-₹{appliedCoupon.discount})</span>
                <button onClick={() => setAppliedCoupon(null)} className="bg-transparent border-none text-[var(--color-error)] cursor-pointer text-[12px]">Remove</button>
              </div>
            )}
          </div>

          <button className="btn btn-primary w-full text-black flex justify-center gap-2 items-center" onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
