import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { CartContext } from '../context/CartContext';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-[var(--color-text-muted)] pt-10">
      <div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
      <p className="font-bold tracking-widest uppercase text-sm">Loading wishlist...</p>
    </div>
  );

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="container min-h-[70vh] flex items-center justify-center pt-10">
        <div className="text-center py-20 px-10 bg-[var(--alt-bg)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] w-full max-w-2xl shadow-inner">
          <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-color)] shadow-sm">
            <Heart size={40} className="text-[var(--color-text-dim)]" />
          </div>
          <h2 className="text-4xl font-black mb-4 text-[var(--color-text-bright)]">Your Wishlist is Empty</h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-md mx-auto">Save premium items you love here to easily find and buy them later.</p>
          <Link to="/products" className="btn btn-primary !px-10 !py-4 text-base shadow-[0_10px_30px_rgba(220,38,38,0.3)]">
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
          <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-bright)] tracking-tight m-0">My Wishlist</h1>
          <p className="text-[var(--color-text-dim)] mt-2 font-medium">Your saved automotive upgrades.</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[var(--color-text-bright)]">{wishlist.length}</span>
          <span className="text-sm font-bold text-[var(--color-text-dim)] uppercase tracking-wider ml-2">Saved</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {wishlist.map(item => (
          <div key={item.id} className="flex flex-col h-full bg-transparent group/card">
            <div className="relative h-[280px] bg-[var(--bg-card)] rounded-[var(--border-radius-lg)] border border-[var(--border-color)] flex items-center justify-center p-6 mb-5 overflow-hidden transition-all duration-500 group-hover/card:border-[var(--color-primary)] group-hover/card:shadow-[0_0_30px_rgba(220,38,38,0.15)] group/img">
              <Link to={`/products/${item.product?.slug}`} className="block h-full w-full flex items-center justify-center">
                <img src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} alt={item.product?.name} className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover/img:scale-110 drop-shadow-2xl" />
              </Link>
              
              <button 
                className="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 border border-red-500/30 text-red-500 hover:text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-10 shadow-lg hover:scale-110" 
                onClick={() => handleRemove(item.id)}
                title="Remove from Wishlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex flex-col grow px-2 text-center">
              <div className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest font-bold mb-1.5">{item.product?.category_name || 'Accessory'}</div>
              <Link to={`/products/${item.product?.slug}`} className="text-[17px] font-bold text-[var(--color-text-bright)] no-underline mb-3 line-clamp-2 hover:text-[var(--color-primary)] transition-colors leading-snug" title={item.product?.name}>
                {item.product?.name}
              </Link>
              <div className="flex items-center justify-center gap-3 mt-auto mb-4">
                <span className="text-[20px] font-black text-[var(--color-text-bright)]">₹{item.product?.discount_price || item.product?.price}</span>
              </div>
              <button className="btn btn-secondary w-full group-hover/card:bg-[var(--color-primary)] group-hover/card:text-white group-hover/card:border-[var(--color-primary)] transition-all duration-300 shadow-sm" onClick={() => addToCart(item.product?.id, 1)} disabled={item.product?.stock_status === 'Out of Stock'}>
                <ShoppingBag size={16} className="mr-2" /> {item.product?.stock_status === 'Out of Stock' ? 'Sold Out' : 'Move to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
