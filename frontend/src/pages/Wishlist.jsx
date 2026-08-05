import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, fetchWishlistCount, showToast } = useContext(CartContext);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const res = await apiRequest('/wishlist/');
    if (res.success) {
      setWishlist(res.data);
    }
    setLoading(false);
  };

  const handleRemove = async (id) => {
    const res = await apiRequest(`/wishlist/${id}/`, { method: 'DELETE' });
    if (res.success) {
      setWishlist(wishlist.filter(item => item.id !== id));
      fetchWishlistCount();
      showToast('Removed from wishlist', 'success');
    }
  };

  if (loading) return <div className="container loading-state">Loading wishlist...</div>;

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container empty-state" style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--alt-bg)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--border-color)', marginTop: '40px' }}>
        <Heart size={48} style={{ color: 'var(--color-text-dim)', marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Save items you love here to buy them later.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', marginTop: '40px' }}>
      <h1 style={{ marginBottom: '32px' }}>My Wishlist</h1>
      <div className="grid-cols-4">
        {wishlist.map(item => (
          <div key={item.id} className="card product-card">
            <div className="product-image-wrapper">
              <Link to={`/products/${item.product?.slug}`} style={{ display: 'block', height: '100%', width: '100%' }}>
                <img src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="product-thumbnail" />
              </Link>
              <button 
                className="quick-wishlist-btn active"
                onClick={() => handleRemove(item.id)}
                title="Remove from Wishlist"
                style={{ background: 'var(--color-primary)', color: '#000' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="product-card-body">
              <Link to={`/products/${item.product?.slug}`} className="product-card-title">{item.product?.name}</Link>
              <div className="price-container">
                <span className="current-price" style={{ color: 'var(--color-primary)' }}>₹{item.product?.discount_price || item.product?.price}</span>
              </div>
              <div className="card-actions" style={{ marginTop: 'auto' }}>
                <button className="btn btn-primary btn-sm" onClick={() => addToCart(item.product?.id, 1)} disabled={item.product?.stock_status === 'Out of Stock'}>
                  <ShoppingCart size={14} style={{ marginRight: '6px' }} />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
