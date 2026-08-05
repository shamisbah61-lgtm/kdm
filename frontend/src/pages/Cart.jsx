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
      <div className="container empty-state" style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--alt-bg)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)', marginTop: '40px' }}>
        <ShoppingBag size={48} style={{ color: 'var(--color-text-dim)', marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', marginTop: '40px' }}>
      <h1 style={{ marginBottom: '32px' }}>Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="card cart-item-card">
              <div className="cart-item-image-wrapper">
                <img src={item.product?.thumbnail || item.product?.images?.[0]?.image || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="cart-item-img" />
              </div>
              <div className="cart-item-details">
                <Link to={`/products/${item.product?.slug}`} className="cart-item-title">{item.product?.name}</Link>
                <span className="cart-item-category">{item.product?.category_name}</span>
                <div className="cart-item-bottom">
                  <div className="cart-item-actions">
                    <div className="qty-controls">
                      <button onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)} className="qty-btn">-</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                  <div className="cart-item-price">
                    ₹{item.subtotal || ((item.product?.discount_price || item.product?.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-summary card" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '24px' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
            <span>Subtotal ({cartItems.length} items)</span>
            <span>₹{totalPrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-bright)' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{appliedCoupon ? (parseFloat(totalPrice) - parseFloat(appliedCoupon.discount)).toFixed(2) : totalPrice}</span>
          </div>

          <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--color-text-bright)' }}>Promo Code</h4>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Code" 
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                style={{ padding: '8px 12px' }}
              />
              <button className="btn btn-primary" onClick={() => handleApplyCoupon(couponInput)} style={{ padding: '8px 16px', color: '#000' }}>
                Apply
              </button>
            </div>
            {couponError && <p style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '8px' }}>{couponError.code || couponError}</p>}
            {appliedCoupon && !couponError && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', background: 'rgba(21,128,61,0.1)', padding: '8px', borderRadius: '4px' }}>
                <span style={{ color: 'var(--color-success)', fontSize: '13px' }}>Coupon '{appliedCoupon.code}' applied! (-₹{appliedCoupon.discount})</span>
                <button onClick={() => setAppliedCoupon(null)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
              </div>
            )}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', color: '#000' }} onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}>
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <style>{`
        .cart-item-card {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 20px;
          padding: 20px;
          margin-bottom: 20px;
          height: auto;
        }
        .cart-item-image-wrapper {
          width: 120px;
          height: 120px;
          min-width: 120px;
          flex-shrink: 0;
          background: var(--alt-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }
        .cart-item-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .cart-item-title {
          font-size: 18px;
          font-weight: bold;
          color: var(--color-text-bright);
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cart-item-category {
          color: var(--color-text-dim);
          font-size: 13px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .cart-item-bottom {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background: var(--bg-card);
        }
        .qty-btn {
          padding: 8px 12px;
          background: none;
          border: none;
          color: var(--color-text-bright);
          cursor: pointer;
        }
        .qty-val {
          font-weight: bold;
          padding: 0 8px;
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--color-error);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }
        .cart-item-price {
          font-size: 18px;
          font-weight: bold;
          color: var(--color-primary);
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
          .cart-item-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .cart-item-image-wrapper {
            width: 100%;
            max-width: 200px;
            height: 200px;
          }
          .cart-item-bottom {
            justify-content: center;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
