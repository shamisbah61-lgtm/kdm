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
        <div className="container">
          <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-dim)] overflow-x-auto [scrollbar-width:none]">
            <Link to="/" className="hover:text-[var(--color-primary)] transition-colors whitespace-nowrap">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors whitespace-nowrap">Shop</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category?.slug || ''}`} className="hover:text-[var(--color-primary)] transition-colors whitespace-nowrap">{product.category_name}</Link>
            <span>/</span>
            <span className="text-[var(--color-text-bright)] whitespace-nowrap overflow-hidden text-ellipsis">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 mb-24">
          
          {/* Images Gallery */}
          <div className="flex flex-col gap-4 sticky top-[100px] h-fit">
            <div className="bg-gradient-to-br from-[var(--alt-bg)] to-[var(--bg-card)] aspect-square md:aspect-[4/3] lg:aspect-square rounded-[var(--border-radius-lg)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center p-8 lg:p-12 shadow-2xl relative group">
              <img src={activeImage || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80'} alt={product.name} className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl" />
              {product.discount_price && (
                <div className="absolute top-6 left-6 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.5)]">
                  Save {Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                </div>
              )}
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3 lg:gap-4 mt-2">
                {allImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`aspect-square border-2 rounded-[var(--border-radius-md)] overflow-hidden transition-all duration-300 p-2 flex items-center justify-center bg-[var(--alt-bg)] ${activeImage === imgUrl ? 'border-[var(--color-primary)] shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-[1.02]' : 'border-[var(--border-color)] hover:border-[var(--color-text-muted)] hover:scale-105'}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-bold tracking-widest uppercase mb-4 w-fit">
              <CheckCircle2 size={14} /> Authentic KDM Part
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-black text-[var(--color-text-bright)] leading-tight mb-4">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-8 border-b border-[var(--border-color)] pb-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 bg-[var(--alt-bg)] px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[var(--color-warning)] text-[var(--color-warning)]" />
                  ))}
                </div>
                <span className="text-sm font-medium text-[var(--color-text-dim)]">{reviews.length} Reviews</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)] hidden sm:block"></div>
              <div className="text-sm font-medium text-[var(--color-text-dim)] flex items-center gap-2">
                SKU: <span className="font-mono text-[var(--color-text-bright)] bg-[var(--alt-bg)] px-2 py-0.5 rounded">{product.sku}</span>
              </div>
            </div>

            <div className="mb-8">
              {product.discount_price ? (
                <div className="flex items-end gap-4">
                  <span className="text-5xl font-black text-[var(--color-primary)] tracking-tight">₹{product.discount_price}</span>
                  <span className="text-xl font-medium text-[var(--color-text-dim)] line-through decoration-red-500/50 mb-1">₹{product.price}</span>
                </div>
              ) : (
                <span className="text-5xl font-black text-[var(--color-text-bright)] tracking-tight">₹{product.price}</span>
              )}
              <p className="text-sm text-[var(--color-text-dim)] mt-2 italic">Prices include all applicable taxes (GST 18%)</p>
            </div>

            <p className="text-lg text-[var(--color-text-muted)] mb-10 leading-relaxed font-medium">
              {product.short_description || product.description?.substring(0, 150) + '...' || 'Premium automotive modification accessory designed for maximum performance and unparalleled aesthetics.'}
            </p>

            <div className="bg-[var(--alt-bg)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-6 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full ${product.stock_status === 'In Stock' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-semibold text-[15px] uppercase tracking-widest text-[var(--color-text-bright)]">
                  {product.stock_status === 'In Stock' ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
                </span>
              </div>

              {product.stock_status === 'In Stock' && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex items-center justify-between border-2 border-[var(--border-color)] rounded-full bg-[var(--bg-card)] overflow-hidden w-full sm:w-[140px] shrink-0 h-[56px] px-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--alt-bg)] text-[var(--color-text-bright)] font-bold transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="font-bold text-[17px] text-[var(--color-text-bright)]">{quantity}</span>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--alt-bg)] text-[var(--color-text-bright)] font-bold transition-colors" onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}>+</button>
                  </div>

                  <button className="btn btn-secondary h-[56px] grow text-[15px] uppercase tracking-wider bg-[var(--bg-card)]" onClick={handleAddToCart}>
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                </div>
              )}
              
              <button className="btn btn-primary w-full h-[60px] text-lg font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(220,38,38,0.3)] mb-4" onClick={handleBuyNow} disabled={product.stock_status === 'Out of Stock'}>
                Buy It Now
              </button>

              <div className="flex gap-3 mt-4">
                <button
                  className={`flex-1 h-[50px] flex items-center justify-center gap-2 rounded-xl border-2 font-semibold transition-all duration-300 ${inWishlist ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--color-text-bright)] hover:border-[var(--color-text-muted)]'}`}
                  onClick={handleWishlistToggle} disabled={wishlistLoading}
                >
                  <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} /> {inWishlist ? 'Saved' : 'Save'}
                </button>
                <button className="w-[50px] shrink-0 h-[50px] flex items-center justify-center rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--color-text-bright)] hover:border-[var(--color-text-muted)] transition-all duration-300" onClick={handleShare}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="flex items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-bright)] m-0">Quality Assured</h4>
                  <p className="text-xs text-[var(--color-text-dim)] m-0 mt-0.5">100% Genuine Parts</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-bright)] m-0">Secure Shipping</h4>
                  <p className="text-xs text-[var(--color-text-dim)] m-0 mt-0.5">Safe & Tracked Delivery</p>
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
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-10 text-center">
                      <Star size={40} className="text-[var(--border-color)] mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-[var(--color-text-bright)] mb-2">No Reviews Yet</h4>
                      <p className="text-[var(--color-text-muted)]">Be the first to share your thoughts on this product.</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
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
                    <div className="bg-gradient-to-b from-[var(--bg-card)] to-[var(--alt-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-xl">
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
                        <button type="submit" className="btn btn-primary w-full shadow-lg">Submit Review</button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 text-center shadow-xl">
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
        <button className="btn btn-secondary flex-1 border-2 font-bold" onClick={handleAddToCart}>
          Cart
        </button>
        <button className="btn btn-primary flex-[1.5] font-black uppercase tracking-widest" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
