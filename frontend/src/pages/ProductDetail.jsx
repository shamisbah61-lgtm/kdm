import { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldAlert, Award, ArrowLeft, Share2 } from 'lucide-react';
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

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch product and reviews
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const res = await apiRequest(`/products/${slug}/`);
      if (res.success) {
        setProduct(res.data);
        setActiveImage(res.data.thumbnail);
        
        // Fetch reviews
        fetchReviews(res.data.id);
        
        // Check wishlist status if logged in
        if (isAuthenticated) {
          checkWishlist(res.data.id);
        }

        // Dynamic SEO Update
        document.title = `${res.data.name} | KDM Kerala Domestic Market`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', res.data.short_description || res.data.description || `Buy ${res.data.name} at the best price.`);
        }
      }
      setLoading(false);
    };
    fetchDetails();
  }, [slug, isAuthenticated]);

  const fetchReviews = async (productId) => {
    const res = await apiRequest(`/reviews/?product=${productId}`);
    if (res.success) {
      setReviews(res.data.results || res.data || []);
    }
  };

  const checkWishlist = async (productId) => {
    const res = await apiRequest('/wishlist/');
    if (res.success) {
      const found = res.data.find(item => item.product.id === productId);
      if (found) {
        setInWishlist(true);
        setWishlistId(found.id);
      } else {
        setInWishlist(false);
        setWishlistId(null);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please login to use Wishlist.', 'error');
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    if (inWishlist) {
      const res = await apiRequest(`/wishlist/${wishlistId}/`, {
        method: 'DELETE',
      });
      if (res.success) {
        setInWishlist(false);
        setWishlistId(null);
        showToast('Removed from wishlist.', 'success');
        fetchWishlistCount();
      }
    } else {
      const res = await apiRequest('/wishlist/', {
        method: 'POST',
        body: { product_id: product.id },
      });
      if (res.success) {
        setInWishlist(true);
        setWishlistId(res.data.id);
        showToast('Added to wishlist!', 'success');
        fetchWishlistCount();
      }
    }
    setWishlistLoading(false);
  };

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const res = await apiRequest('/reviews/', {
      method: 'POST',
      body: {
        product: product.id,
        rating,
        comment,
      },
    });

    if (res.success) {
      setSubmitSuccess('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews(product.id);
    } else {
      setSubmitError(res.message || 'Failed to submit review.');
    }
  };

  const handleShare = () => {
    if (!product) return;
    const url = window.location.href;
    const title = `${product.name} at KDM`;
    
    if (navigator.share) {
      navigator.share({
        title,
        url
      }).catch(err => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) return <div className="text-center py-[60px] text-[var(--color-text-muted)] container">Loading collection details...</div>;
  if (!product) return <div className="container text-center py-[80px] bg-[var(--alt-bg)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--border-color)] mt-10">Product not found.</div>;

  // Gather all images (thumbnail + gallery images)
  const allImages = [product.thumbnail, ...(product.images || []).map(img => img.image)].filter(Boolean);

  return (
    <div className="container animate-fade-in">
      <div className="mb-6 mt-2.5">
        <Link to="/products" className="inline-flex items-center gap-2 text-[var(--color-text-muted)] no-underline text-sm font-medium transition-all duration-300 hover:text-[var(--color-primary)] hover:-translate-x-1">
          <ArrowLeft size={16} /> Back to Collection
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] md:gap-[50px] mb-[100px] md:mb-20">
        
        {/* Images Column */}
        <div className="flex flex-col">
          <div className="bg-[var(--alt-bg)] h-[480px] rounded-[var(--border-radius-lg)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center p-6">
            <img src={activeImage || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600'} alt={product.name} className="max-w-full max-h-full w-auto h-auto object-contain" />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {allImages.map((imgUrl, i) => (
                <button
                  key={i}
                  className={`border ${activeImage === imgUrl || (!activeImage && i === 0) ? 'border-[var(--color-primary)] -translate-y-0.5' : 'border-[var(--border-color)]'} bg-[var(--alt-bg)] w-20 h-20 rounded-[var(--border-radius-md)] overflow-hidden cursor-pointer transition-all duration-300 shrink-0 p-1.5 flex items-center justify-center hover:border-[var(--color-primary)] hover:-translate-y-0.5`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i}`} className="max-w-full max-h-full w-auto h-auto object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-center">
          <span className="text-[var(--color-primary)] text-[13px] uppercase font-semibold tracking-wider mb-2">{product.category_name}</span>
          <h1 className="text-4xl leading-[1.2] mb-3">{product.name}</h1>
          
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-[var(--color-primary)] text-[var(--color-primary)]" />
              ))}
            </div>
            <span className="text-[13px] text-[var(--color-text-dim)]">({reviews.length} Customer Reviews)</span>
          </div>

          <div className="mb-4">
            {product.discount_price ? (
              <>
                <span className="text-3xl font-bold text-[var(--color-primary)]">₹{product.discount_price}</span>
                <span className="text-lg text-[var(--color-text-dim)] line-through ml-3">₹{product.price}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-[var(--color-primary)]">₹{product.price}</span>
            )}
          </div>

          <div className="text-[13px] text-[var(--color-text-dim)] mb-3">SKU: {product.sku}</div>

          <div className="text-sm text-[var(--color-text-muted)] mb-[30px] flex items-center">
            Availability: &nbsp;
            {product.stock_status === 'In Stock' ? (
              <span className="badge badge-success">In Stock ({product.quantity} left)</span>
            ) : (
              <span className="badge badge-error">Out of Stock</span>
            )}
          </div>

          <div className="border-t border-[var(--border-color)] pt-6 mb-[30px]">
            <h3 className="text-base uppercase tracking-wider mb-3">Description</h3>
            <p className="text-[var(--color-text-muted)] text-[15px]">{product.description || 'No description available for this accessory.'}</p>
          </div>

          {/* Actions */}
          {product.stock_status === 'In Stock' && (
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center border border-[var(--border-color)] rounded-[var(--border-radius-md)] bg-[rgba(22,16,13,0.5)] overflow-hidden">
                <button className="border-none bg-transparent text-[var(--color-text-bright)] w-10 h-11 cursor-pointer text-lg hover:bg-[rgba(212,175,55,0.1)]" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="px-3 font-semibold text-[15px] text-[var(--color-text-bright)]">{quantity}</span>
                <button className="border-none bg-transparent text-[var(--color-text-bright)] w-10 h-11 cursor-pointer text-lg hover:bg-[rgba(212,175,55,0.1)]" onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}>+</button>
              </div>

              <button className="btn btn-secondary grow h-12 text-black text-[15px] rounded-full flex justify-center items-center gap-2" onClick={handleAddToCart}>
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button className="btn btn-primary grow h-12 text-black text-[15px] rounded-full flex justify-center items-center gap-2 bg-[#f59e0b] border-[#f59e0b] hover:bg-[#d97706]" onClick={handleBuyNow}>
                Buy Now
              </button>

              <button
                className={`btn btn-secondary h-[46px] w-[46px] p-0 flex items-center justify-center rounded-md ${inWishlist ? 'border-[var(--color-primary)]' : ''}`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={18} fill={inWishlist ? 'var(--color-primary)' : 'none'} color={inWishlist ? 'var(--color-primary)' : 'currentColor'} />
              </button>

              <button
                className="btn btn-secondary h-[46px] w-[46px] p-0 flex items-center justify-center rounded-md"
                onClick={handleShare}
                title="Share via Device"
              >
                <Share2 size={18} />
              </button>

              <a
                href={`https://wa.me/?text=Check out this amazing product: ${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary h-[46px] w-[46px] p-0 flex items-center justify-center rounded-md bg-[#25D366] border-[#25D366] text-white hover:bg-[#1da851]"
                title="Share on WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Reviews & Feedback Section */}
      <section className="border-t border-[var(--border-color)] pt-[60px] mb-20">
        <h2 className="mb-10 text-3xl font-[var(--font-heading)]">Customer Reviews</h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-[50px]">
          {/* Review List */}
          <div className="flex flex-col">
            {reviews.length === 0 ? (
              <p className="text-[var(--color-text-dim)] italic">No reviews yet for this selection. Be the first to share your thoughts!</p>
            ) : (
              <div className="flex flex-col gap-5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-[rgba(22,16,13,0.3)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-6">
                    <div className="flex justify-between mb-3 items-start flex-wrap gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--color-primary)] flex items-center justify-center border-2 border-[var(--border-color)]">
                          {rev.user?.profile_image ? (
                            <img src={rev.user.profile_image} alt={rev.user.first_name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-black font-bold text-base">
                              {(rev.user?.first_name || rev.user?.email || 'V').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-[15px] font-[var(--font-body)] m-0">{rev.user?.first_name || 'Verified Buyer'}</h4>
                          <div className="flex gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < rev.rating ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-primary)]"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {rev.verified_purchase && (
                          <span className="badge badge-success text-[9px] font-bold px-1.5 py-0.5 inline-flex items-center gap-1">
                            <Award size={10} /> Verified Purchase
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-text-dim)]">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {rev.comment && <p className="text-sm text-[var(--color-text-muted)] mt-0">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div className="flex flex-col">
            {isAuthenticated ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-8">
                <h3 className="mb-6 text-lg m-0">Write a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  {submitError && <div className="bg-[rgba(219,68,55,0.15)] border border-[var(--color-error)] text-[var(--color-error)] p-3 rounded-[var(--border-radius-md)] mb-4 text-[13px]">{submitError}</div>}
                  {submitSuccess && <div className="bg-[rgba(82,164,71,0.15)] border border-[var(--color-success)] text-[var(--color-success)] p-3 rounded-[var(--border-radius-md)] mb-4 text-[13px]">{submitSuccess}</div>}

                  <div className="mb-4">
                    <label className="form-label block mb-2">Rating</label>
                    <select
                      className="form-input w-full"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Very Good)</option>
                      <option value="3">3 Stars (Good)</option>
                      <option value="2">2 Stars (Average)</option>
                      <option value="1">1 Star (Poor)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label block mb-2">Comment</label>
                    <textarea
                      rows="4"
                      className="form-input w-full"
                      placeholder="Share details of your experience with this accessory..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-2">
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--border-radius-lg)] p-10 text-[var(--color-text-muted)] flex flex-col items-center">
                <ShieldAlert size={28} className="mb-2" />
                <p className="my-3 text-sm">Please log in to write a review and share your feedback.</p>
                <Link to="/login" className="btn btn-secondary mt-2">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Mobile Buy Bar for Quick Checkout */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-card)] border-t border-[var(--border-color)] p-3 px-5 gap-3 z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <button className="btn btn-secondary flex-1 py-3 text-[15px]" onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button className="btn btn-primary flex-1 py-3 text-[15px] bg-[#f59e0b] border-[#f59e0b] text-black" onClick={handleBuyNow}>
          Buy Now
        </button>
      </div>
    </div>
  );
}
