import { createContext, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const playSound = (soundType) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (soundType === 'cart') {
        // Premium soft tick for cart
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      } else if (soundType === 'wishlist') {
        // Very subtle pop for wishlist
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
      } else {
        // Error / Default
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.log('Audio play error', e);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    
    // Play different sounds based on action
    if (type === 'error') {
      playSound('error');
    } else if (message.toLowerCase().includes('wishlist')) {
      playSound('wishlist');
    } else {
      playSound('cart');
    }

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    const res = await apiRequest('/cart/');
    if (res.success) {
      setCart(res.data);
    }
    setLoading(false);
  };

  const fetchWishlistCount = async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    const res = await apiRequest('/wishlist/');
    if (res.success) {
      setWishlistCount(res.data.length);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchWishlistCount();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart.', 'error');
      return { success: false, message: 'Please login to add items to cart.' };
    }
    const res = await apiRequest('/cart/add/', {
      method: 'POST',
      body: { product_id: productId, quantity },
    });
    if (res.success) {
      setCart(res.data);
      showToast('Item successfully added to cart!');
    } else {
      showToast(res.message || 'Error adding to cart', 'error');
    }
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await apiRequest(`/cart/${itemId}/update/`, {
      method: 'PUT',
      body: { quantity },
    });
    if (res.success) {
      setCart(res.data);
    }
    return res;
  };

  const removeFromCart = async (itemId) => {
    const res = await apiRequest(`/cart/${itemId}/remove/`, {
      method: 'DELETE',
    });
    if (res.success) {
      setCart(res.data);
    }
    return res;
  };

  const clearCart = async () => {
    const res = await apiRequest('/cart/clear/', {
      method: 'DELETE',
    });
    if (res.success) {
      setCart(res.data);
    }
    return res;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        showToast,
        fetchWishlistCount,
        wishlistCount,
        totalItemsCount: cart?.total_items_count || 0,
        totalPrice: cart?.total_price || '0.00',
      }}
    >
      {children}
      {toast && (
        <div className={`cart-toast-notification ${toast.type}`}>
          <div className="toast-message">{toast.message}</div>
          {toast.type === 'success' && (
            <Link 
              to={toast.message.toLowerCase().includes('wishlist') ? '/wishlist' : '/cart'} 
              className="btn-toast-view"
            >
              {toast.message.toLowerCase().includes('wishlist') ? 'View Wishlist' : 'View Cart'}
            </Link>
          )}
        </div>
      )}
      <style>{`
        .cart-toast-notification {
          position: fixed;
          bottom: 40px;
          right: 40px;
          background: var(--bg-card);
          border: 1px solid var(--color-primary);
          padding: 16px 24px;
          border-radius: var(--border-radius-md);
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          gap: 20px;
          z-index: 9999;
          animation: slideInRightToast 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cart-toast-notification.error {
          border-color: #ef4444;
        }
        .toast-message {
          color: var(--color-text-bright);
          font-size: 15px;
          font-weight: 500;
        }
        .btn-toast-view {
          background: var(--color-primary);
          color: #0c0a09;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          transition: transform 0.2s;
        }
        .btn-toast-view:hover {
          transform: scale(1.05);
        }
        @keyframes slideInRightToast {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </CartContext.Provider>
  );
};
