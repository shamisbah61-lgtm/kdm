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
          <div key={item.id} className="group relative flex flex-col bg-white rounded-3xl p-4 sm:p-5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 h-full border border-transparent hover:border-black/5">
            
            <Link to={`/products/${item.product?.slug}`} className="absolute inset-0 z-0 rounded-3xl" aria-label={`View ${item.product?.name}`}></Link>
            
            <div className="relative z-0 w-full aspect-[4/5] mb-5 rounded-2xl bg-[#FBFBFD] overflow-hidden flex items-center justify-center p-6 transition-colors duration-500 group-hover:bg-white">
              {item.product?.discount_price && (
                <span className="absolute top-3 left-3 bg-[#E83422] text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-sm tracking-widest uppercase">Sale</span>
              )}
              
              {/* Remove Button Overlay */}
              <button 
                className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full border border-[#EAEAEA] text-gray-500 flex items-center justify-center hover:bg-white hover:text-[#E83422] hover:border-[#E83422] transition-colors shadow-sm"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(item.id); }}
                title="Remove from Wishlist"
              >
                <Trash2 size={14} />
              </button>

              <img 
                src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400'} 
                alt={item.product?.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]" 
              />
            </div>
            
            <div className="flex flex-col flex-1 text-left px-1 relative z-0 pointer-events-none">
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">{item.product?.category_name || 'Accessory'}</div>
              <h3 className="text-[16px] md:text-[17px] font-semibold text-[#1D1D1F] line-clamp-2 leading-snug mb-1">{item.product?.name}</h3>
              
              <div className="flex items-end justify-between mt-auto pt-4 border-t border-[#F5F5F7] pointer-events-auto relative z-10">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-0.5">Price</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.product?.discount_price ? (
                      <>
                        <span className="text-[16px] font-bold text-[#1D1D1F]">₹{item.product?.discount_price}</span>
                        <span className="text-[12px] font-medium text-[#86868B] line-through">₹{item.product?.price}</span>
                      </>
                    ) : (
                      <span className="text-[16px] font-bold text-[#1D1D1F]">₹{item.product?.price}</span>
                    )}
                  </div>
                </div>
                
                <button 
                  className="bg-[#F5F5F7] hover:bg-[#1D1D1F] text-[#1D1D1F] hover:text-white text-[13px] font-semibold py-2 px-4 rounded-full transition-all active:scale-95 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(item.product?.id, 1); }}
                  disabled={item.product?.stock_status === 'Out of Stock'}
                >
                  {item.product?.stock_status === 'Out of Stock' ? 'Sold Out' : 'Move to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
