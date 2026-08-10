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
      <div className="container empty-state py-20 px-6 text-center bg-[var(--alt-bg)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] mt-10">
        <Heart size={48} className="text-[var(--color-text-dim)] mb-4 mx-auto" />
        <h2 className="mb-2">Your Wishlist is Empty</h2>
        <p className="text-[var(--color-text-muted)]">Save items you love here to buy them later.</p>
        <Link to="/products" className="btn btn-primary mt-6 inline-block">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in pb-20 mt-10">
      <h1 className="mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map(item => (
          <div key={item.id} className="card product-card flex flex-col">
            <div className="product-image-wrapper">
              <Link to={`/products/${item.product?.slug}`} className="block h-full w-full">
                <img src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="product-thumbnail" />
              </Link>
              <button 
                className="quick-wishlist-btn active !bg-[var(--color-primary)] !text-black"
                onClick={() => handleRemove(item.id)}
                title="Remove from Wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="product-card-body flex-1 flex flex-col">
              <Link to={`/products/${item.product?.slug}`} className="product-card-title">{item.product?.name}</Link>
              <div className="price-container">
                <span className="current-price text-[var(--color-primary)]">₹{item.product?.discount_price || item.product?.price}</span>
              </div>
              <div className="card-actions mt-auto">
                <button className="btn btn-primary btn-sm flex items-center justify-center gap-1.5 w-full" onClick={() => addToCart(item.product?.id, 1)} disabled={item.product?.stock_status === 'Out of Stock'}>
                  <ShoppingCart size={14} />
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
