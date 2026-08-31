import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldAlert, Award, ArrowLeft, Share2, CheckCircle2, Package, Truck, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart, showToast, fetchWishlistCount } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetails = async () => {
      setLoading(true);
      const res = await apiRequest(`/products/${slug}/`);
      if (res.success) {
        setProduct(res.data);
        setActiveImage(res.data.thumbnail);
        fetchReviews(res.data.id);
        if (isAuthenticated) checkWishlist(res.data.id);

        document.title = `${res.data.name} | KDM Premium Garage`;
      }
      setLoading(false);
    };
    fetchDetails();
  }, [slug, isAuthenticated]);

  const fetchReviews = async (productId) => {
    const res = await apiRequest(`/reviews/?product=${productId}`);
    if (res.success) setReviews(res.data.results || res.data || []);
  };

  const checkWishlist = async (productId) => {
    const res = await apiRequest('/wishlist/');
    if (res.success) {
      const found = res.data.find(item => item.product.id === productId);
      if (found) { setInWishlist(true); setWishlistId(found.id); }
      else { setInWishlist(false); setWishlistId(null); }
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { showToast('Please login to use Wishlist.', 'error'); navigate('/login'); return; }
    setWishlistLoading(true);
    if (inWishlist) {
      const res = await apiRequest(`/wishlist/${wishlistId}/`, { method: 'DELETE' });
      if (res.success) { setInWishlist(false); setWishlistId(null); showToast('Removed from wishlist.', 'success'); fetchWishlistCount(); }
    } else {
      const res = await apiRequest('/wishlist/', { method: 'POST', body: { product_id: product.id } });
      if (res.success) { setInWishlist(true); setWishlistId(res.data.id); showToast('Added to wishlist!', 'success'); fetchWishlistCount(); }
    }
    setWishlistLoading(false);
  };

  const handleAddToCart = async () => await addToCart(product.id, quantity);
  const handleBuyNow = async () => { const res = await addToCart(product.id, quantity); if (res.success) navigate('/checkout'); };

  const handleReviewSubmit = async (e) => {
    e.preventDefault(); setSubmitError(''); setSubmitSuccess('');
    const res = await apiRequest('/reviews/', { method: 'POST', body: { product: product.id, rating, comment }});
    if (res.success) { setSubmitSuccess('Review submitted successfully!'); setComment(''); setRating(5); fetchReviews(product.id); }
    else { setSubmitError(res.message || 'Failed to submit review.'); }
  };

  const handleShare = () => {
    if (!product) return;
    const url = window.location.href;
    if (navigator.share) { navigator.share({ title: `${product.name} at KDM`, url }).catch(err => console.error(err)); }
    else { navigator.clipboard.writeText(url); showToast('Link copied to clipboard!', 'success'); }
  };

  if (loading) return <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-[var(--color-text-muted)]"><div className="w-12 h-12 border-4 border-[var(--border-color)] border-t-[var(--color-primary)] rounded-full animate-spin"></div><p className="font-semibold tracking-widest uppercase">Loading details...</p></div>;
  if (!product) return <div className="container min-h-[70vh] flex items-center justify-center"><div className="text-center py-20 px-10 bg-[var(--bg-card)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] w-full max-w-2xl"><h2 className="text-3xl font-black mb-4 text-[var(--color-text-bright)]">Product Not Found</h2><p className="text-[var(--color-text-muted)] mb-8">The requested accessory doesn't exist or has been removed.</p><Link to="/products" className="btn btn-primary">Return to Shop</Link></div></div>;

  const allImages = [product.thumbnail, ...(product.images || []).map(img => img.image)].filter(Boolean);

  return (
    <div className="animate-fade-in pt-10">
      
      {/* Breadcrumb */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-color)] py-4 mb-10">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#86868B] overflow-x-auto [scrollbar-width:none]">
            <Link to="/" className="hover:text-[#1D1D1F] transition-colors whitespace-nowrap">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#1D1D1F] transition-colors whitespace-nowrap">Shop</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category?.slug || ''}`} className="hover:text-[#1D1D1F] transition-colors whitespace-nowrap">{product.category_name}</Link>
            <span>/</span>
            <span className="text-[#1D1D1F] whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 mb-24">
          
          {/* Images Gallery */}
          <div className="flex flex-col gap-4 sticky top-[100px] h-fit">
            <div className="bg-[#FBFBFD] aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden flex items-center justify-center p-8 lg:p-16 relative group transition-colors duration-500 hover:bg-white border border-transparent hover:border-[#EAEAEA]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
              <img src={activeImage || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80'} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
              {product.discount_price && (
                <div className="absolute top-6 left-6 bg-[#E83422] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Save {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3 lg:gap-4 mt-2">
                {allImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`aspect-square rounded-2xl overflow-hidden transition-all duration-300 p-2 flex items-center justify-center bg-[#FBFBFD] ${activeImage === imgUrl ? 'border-2 border-[#1D1D1F] shadow-sm' : 'border border-transparent hover:border-[#EAEAEA] hover:bg-white'}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col px-2 md:px-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] leading-tight mb-4 tracking-tight">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <span className="text-[13px] font-medium text-[#86868B]">{reviews.length} Reviews</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-[#D2D2D7] hidden sm:block"></div>
              <div className="text-[13px] font-medium text-[#86868B] flex items-center gap-1">
                SKU: <span className="text-[#1D1D1F]">{product.sku}</span>
              </div>
            </div>

            <div className="mb-8 pb-8 border-b border-[#F5F5F7]">
              {product.discount_price ? (
                <div className="flex items-end gap-3">
                  <span className="text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">₹{product.discount_price}</span>
                  <span className="text-lg font-medium text-[#86868B] line-through mb-1">₹{product.price}</span>
                </div>
              ) : (
                <span className="text-3xl lg:text-4xl font-semibold text-[#1D1D1F] tracking-tight">₹{product.price}</span>
              )}
            </div>

            <p className="text-[17px] text-[#86868B] mb-10 leading-relaxed">
              {product.short_description || product.description?.substring(0, 150) + '...' || 'Premium automotive modification accessory designed for maximum performance and unparalleled aesthetics.'}
            </p>

            <div className="bg-[#FBFBFD] border border-[#EAEAEA]/60 rounded-3xl p-6 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2.5 h-2.5 rounded-full ${product.stock_status === 'In Stock' ? 'bg-[#34C759] animate-pulse' : 'bg-[#FF3B30]'}`}></div>
                <span className="font-semibold text-[13px] uppercase tracking-widest text-[#1D1D1F]">
                  {product.stock_status === 'In Stock' ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
                </span>
              </div>

              {product.stock_status === 'In Stock' && (
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center justify-between border border-[#EAEAEA] rounded-full bg-white overflow-hidden w-full sm:w-[130px] shrink-0 h-[52px] px-2 shadow-sm">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="font-semibold text-[16px] text-[#1D1D1F]">{quantity}</span>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors" onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}>+</button>
                  </div>

                  <button className="flex-1 bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] font-semibold h-[52px] rounded-full transition-all active:scale-95 flex items-center justify-center gap-2" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                </div>
              )}
              
              <button className="w-full bg-[#1D1D1F] hover:bg-[#333333] text-white font-semibold h-[52px] rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none" onClick={handleBuyNow} disabled={product.stock_status === 'Out of Stock'}>
                Buy It Now
              </button>

              <div className="flex gap-3 mt-4">
                <button
                  className={`flex-1 h-[52px] flex items-center justify-center gap-2 rounded-full border font-medium transition-all duration-300 ${inWishlist ? 'border-[#E83422] bg-[#E83422]/5 text-[#E83422]' : 'border-[#EAEAEA] bg-white text-[#1D1D1F] hover:border-[#1D1D1F]'}`}
                  onClick={handleWishlistToggle} disabled={wishlistLoading}
                >
                  <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} /> {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>
                <button className="w-[52px] shrink-0 h-[52px] flex items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#1D1D1F] hover:border-[#1D1D1F] transition-all duration-300" onClick={handleShare}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="flex items-center gap-3 p-4 bg-white border border-[#F5F5F7] shadow-sm rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[#1D1D1F] m-0">Quality Assured</h4>
                  <p className="text-[12px] text-[#86868B] m-0 mt-0.5">100% Genuine Parts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border border-[#F5F5F7] shadow-sm rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-[#1D1D1F] m-0">Secure Shipping</h4>
                  <p className="text-[12px] text-[#86868B] m-0 mt-0.5">Safe & Tracked Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-[var(--alt-bg)] border-y border-[var(--border-color)] pt-16 pb-24">
        <div className="container">
          <div className="flex gap-8 border-b border-[var(--border-color)] mb-10 overflow-x-auto [scrollbar-width:none]">
            <button className={`pb-4 text-lg font-bold tracking-wider uppercase transition-colors whitespace-nowrap border-b-4 ${activeTab === 'description' ? 'border-[var(--color-primary)] text-[var(--color-text-bright)]' : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setActiveTab('description')}>
              Product Description
            </button>
            <button className={`pb-4 text-lg font-bold tracking-wider uppercase transition-colors whitespace-nowrap border-b-4 ${activeTab === 'reviews' ? 'border-[var(--color-primary)] text-[var(--color-text-bright)]' : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-bright)]'}`} onClick={() => setActiveTab('reviews')}>
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="max-w-4xl">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
                  {product.description || 'Elevate your vehicle\'s performance and styling with this premium KDM accessory. Engineered for precision fitment and crafted from high-grade materials to ensure durability and an aggressive aesthetic.'}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-12">
                <div className="flex flex-col gap-6">
                  {reviews.length === 0 ? (
                    <div className="bg-white border border-[#F5F5F7] rounded-[28px] p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-all duration-400">
                      <Star size={40} className="text-[var(--border-color)] mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-[var(--color-text-bright)] mb-2">No Reviews Yet</h4>
                      <p className="text-[var(--color-text-muted)]">Be the first to share your thoughts on this product.</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-white border border-[#F5F5F7] rounded-[28px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-all duration-400">
                        <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-amber-500 flex items-center justify-center shrink-0">
                              {rev.user?.profile_image ? (
                                <img src={rev.user.profile_image} alt="User" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-black text-lg shadow-sm">{(rev.user?.first_name || 'V').charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-[var(--color-text-bright)] m-0">{rev.user?.first_name || 'Verified Buyer'}</h4>
                              <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < rev.rating ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-[var(--color-text-dim)]"} />)}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-[var(--color-text-dim)] bg-[var(--alt-bg)] px-3 py-1 rounded-full">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                        {rev.comment && <p className="text-base text-[var(--color-text-muted)] leading-relaxed m-0">{rev.comment}</p>}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col sticky top-[100px] h-fit">
                  {isAuthenticated ? (
                    <div className="bg-white border border-[#F5F5F7] rounded-[28px] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-all duration-400">
                      <h3 className="text-xl font-bold mb-6 text-[var(--color-text-bright)] flex items-center gap-2"><Star className="text-[var(--color-primary)]"/> Write a Review</h3>
                      <form onSubmit={handleReviewSubmit}>
                        {submitError && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium">{submitError}</div>}
                        {submitSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl mb-6 text-sm font-medium">{submitSuccess}</div>}

                        <div className="mb-5">
                          <label className="block text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-wider mb-2">Rating</label>
                          <select className="form-input w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl font-medium" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                            <option value="5">5 Stars (Excellent)</option>
                            <option value="4">4 Stars (Very Good)</option>
                            <option value="3">3 Stars (Good)</option>
                            <option value="2">2 Stars (Average)</option>
                            <option value="1">1 Star (Poor)</option>
                          </select>
                        </div>
                        <div className="mb-6">
                          <label className="block text-xs font-bold text-[var(--color-text-dim)] uppercase tracking-wider mb-2">Your Experience</label>
                          <textarea rows="4" className="form-input w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl resize-none font-medium" placeholder="Share details of your experience..." value={comment} onChange={(e) => setComment(e.target.value)} required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Submit Review</button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#F5F5F7] rounded-[28px] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.05)] transition-all duration-400">
                      <div className="w-16 h-16 bg-[var(--alt-bg)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)]">
                        <ShieldAlert size={28} className="text-[var(--color-primary)]" />
                      </div>
                      <h4 className="text-lg font-bold text-[var(--color-text-bright)] mb-2">Login Required</h4>
                      <p className="text-sm text-[var(--color-text-muted)] mb-6">Please log in to your account to write a review and share your feedback.</p>
                      <Link to="/login" className="btn btn-primary w-full">Sign In Now</Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Buy Bar */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)]/95 backdrop-blur-xl border-t border-[var(--border-color)] p-4 gap-3 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <button className="btn btn-secondary flex-1" onClick={handleAddToCart}>
          Cart
        </button>
        <button className="btn btn-primary flex-[1.5]" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
