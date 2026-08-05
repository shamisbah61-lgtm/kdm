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

  if (loading) return <div className="loading-state container">Loading collection details...</div>;
  if (!product) return <div className="container empty-state">Product not found.</div>;

  // Gather all images (thumbnail + gallery images)
  const allImages = [product.thumbnail, ...(product.images || []).map(img => img.image)].filter(Boolean);

  return (
    <div className="container animate-fade-in">
      <div className="back-navigation">
        <Link to="/products" className="btn-back">
          <ArrowLeft size={16} /> Back to Collection
        </Link>
      </div>

      <div className="product-detail-layout">
        
        {/* Images Column */}
        <div className="gallery-column">
          <div className="main-image-container">
            <img src={activeImage || 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600'} alt={product.name} className="main-image" />
          </div>
          {allImages.length > 1 && (
            <div className="thumbnails-row">
              {allImages.map((imgUrl, i) => (
                <button
                  key={i}
                  className={`thumbnail-btn ${(activeImage === imgUrl || (!activeImage && i === 0)) ? 'active' : ''}`}
                  onClick={() => setActiveImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i}`} className="thumbnail-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="info-column">
          <span className="product-category">{product.category_name}</span>
          <h1 className="product-title">{product.name}</h1>
          
          <div className="rating-row-detail">
            <div className="stars-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="var(--color-primary)" color="var(--color-primary)" />
              ))}
            </div>
            <span className="rating-text">({reviews.length} Customer Reviews)</span>
          </div>

          <div className="price-tag-detail">
            {product.discount_price ? (
              <>
                <span className="current-price-detail">₹{product.discount_price}</span>
                <span className="original-price-detail">₹{product.price}</span>
              </>
            ) : (
              <span className="current-price-detail">₹{product.price}</span>
            )}
          </div>

          <div className="sku-tag">SKU: {product.sku}</div>

          <div className="stock-info">
            Availability: &nbsp;
            {product.stock_status === 'In Stock' ? (
              <span className="badge badge-success">In Stock ({product.quantity} left)</span>
            ) : (
              <span className="badge badge-error">Out of Stock</span>
            )}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available for this accessory.'}</p>
          </div>

          {/* Actions */}
          {product.stock_status === 'In Stock' && (
            <div className="action-row">
              <div className="quantity-selector">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="qty-val">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}>+</button>
              </div>

              <button className="btn btn-secondary btn-add-cart" onClick={handleAddToCart}>
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button className="btn btn-primary btn-buy-now" onClick={handleBuyNow} style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}>
                Buy Now
              </button>

              <button
                className={`btn btn-secondary wishlist-toggle-btn ${inWishlist ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={18} fill={inWishlist ? 'var(--color-primary)' : 'none'} color={inWishlist ? 'var(--color-primary)' : 'currentColor'} />
              </button>

              <button
                className="btn btn-secondary wishlist-toggle-btn"
                onClick={handleShare}
                title="Share via Device"
              >
                <Share2 size={18} />
              </button>

              <a
                href={`https://wa.me/?text=Check out this amazing product: ${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary wishlist-toggle-btn"
                title="Share on WhatsApp"
                style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
      <section className="reviews-section">
        <h2>Customer Reviews</h2>

        <div className="reviews-grid-layout">
          {/* Review List */}
          <div className="reviews-list-col">
            {reviews.length === 0 ? (
              <p className="no-reviews-msg">No reviews yet for this selection. Be the first to share your thoughts!</p>
            ) : (
              <div className="review-cards-list">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {rev.user?.profile_image ? (
                            <img src={rev.user.profile_image} alt={rev.user.first_name || 'User'} />
                          ) : (
                            <div className="avatar-placeholder">
                              {(rev.user?.first_name || rev.user?.email || 'V').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="reviewer-name">{rev.user?.first_name || 'Verified Buyer'}</h4>
                          <div className="review-stars">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill={i < rev.rating ? 'var(--color-primary)' : 'none'} color="var(--color-primary)" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="review-badges">
                        {rev.verified_purchase && (
                          <span className="badge badge-success verified-badge">
                            <Award size={10} /> Verified Purchase
                          </span>
                        )}
                        <span className="review-date">{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {rev.comment && <p className="review-comment-text">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div className="reviews-form-col">
            {isAuthenticated ? (
              <div className="write-review-card">
                <h3>Write a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  {submitError && <div className="error-banner">{submitError}</div>}
                  {submitSuccess && <div className="success-banner">{submitSuccess}</div>}

                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-input"
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

                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea
                      rows="4"
                      className="form-input"
                      placeholder="Share details of your experience with this accessory..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="review-login-prompt">
                <ShieldAlert size={28} />
                <p>Please log in to write a review and share your feedback.</p>
                <Link to="/login" className="btn btn-secondary">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Mobile Buy Bar for Quick Checkout */}
      <div className="mobile-sticky-actions">
        <button className="btn btn-secondary" onClick={handleAddToCart} style={{ flex: 1, padding: '12px' }}>
          Add to Cart
        </button>
        <button className="btn btn-primary" onClick={handleBuyNow} style={{ flex: 1, padding: '12px', backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: '#000' }}>
          Buy Now
        </button>
      </div>

      <style>{`
        .back-navigation {
          margin-bottom: 24px;
          margin-top: 10px;
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition-smooth);
        }
        .btn-back:hover {
          color: var(--color-primary);
          transform: translateX(-4px);
        }
        .product-detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
          margin-bottom: 80px;
        }
        @media (max-width: 768px) {
          .product-detail-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
        .main-image-container {
          background: var(--alt-bg);
          height: 480px;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .main-image {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        .thumbnails-row {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          overflow-x: auto;
        }
        .thumbnail-btn {
          border: 1px solid var(--border-color);
          background: var(--alt-bg);
          width: 80px;
          height: 80px;
          border-radius: var(--border-radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition-smooth);
          flex-shrink: 0;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .thumbnail-btn.active, .thumbnail-btn:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }
        .thumbnail-img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        .info-column {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .product-category {
          color: var(--color-primary);
          font-size: 13px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .product-title {
          font-size: 36px;
          line-height: 1.2;
          margin-bottom: 12px;
        }
        .rating-row-detail {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .stars-row {
          display: flex;
          gap: 2px;
        }
        .rating-text {
          font-size: 13px;
          color: var(--color-text-dim);
        }
        .price-tag-detail {
          margin-bottom: 16px;
        }
        .current-price-detail {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-primary);
        }
        .original-price-detail {
          font-size: 18px;
          color: var(--color-text-dim);
          text-decoration: line-through;
          margin-left: 12px;
        }
        .sku-tag {
          font-size: 13px;
          color: var(--color-text-dim);
          margin-bottom: 12px;
        }
        .stock-info {
          font-size: 14px;
          color: var(--color-text-muted);
          margin-bottom: 30px;
          display: flex;
          align-items: center;
        }
        .product-description {
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
          margin-bottom: 30px;
        }
        .product-description h3 {
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .product-description p {
          color: var(--color-text-muted);
          font-size: 15px;
        }
        .action-row {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          background: rgba(22, 16, 13, 0.5);
          overflow: hidden;
        }
        .qty-btn {
          border: none;
          background: none;
          color: var(--color-text-bright);
          width: 40px;
          height: 44px;
          cursor: pointer;
          font-size: 18px;
        }
        .qty-btn:hover {
          background: rgba(212, 175, 55, 0.1);
        }
        .qty-val {
          padding: 0 12px;
          font-weight: 600;
          font-size: 15px;
          color: var(--color-text-bright);
        }
        .btn-add-cart, .btn-buy-now {
          flex-grow: 1;
          height: 48px;
          color: #000;
          font-size: 15px;
          border-radius: 24px;
        }
        .wishlist-toggle-btn {
          height: 46px;
          width: 46px;
          padding: 0;
        }
        .wishlist-toggle-btn.active {
          border-color: var(--color-primary);
        }
        .reviews-section {
          border-top: 1px solid var(--border-color);
          padding-top: 60px;
          margin-bottom: 80px;
        }
        .reviews-section h2 {
          margin-bottom: 40px;
        }
        .reviews-grid-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 50px;
        }
        @media (max-width: 992px) {
          .reviews-grid-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
        .no-reviews-msg {
          color: var(--color-text-dim);
          font-style: italic;
        }
        .review-cards-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .review-item-card {
          background: rgba(22,16,13,0.3);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
        }
        .review-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 10px;
        }
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--border-color);
        }
        .reviewer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-placeholder {
          color: #000;
          font-weight: bold;
          font-size: 16px;
        }
        .reviewer-name {
          font-size: 15px;
          font-family: var(--font-body);
        }
        .review-stars {
          display: flex;
          gap: 2px;
          margin-top: 4px;
        }
        .review-badges {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .verified-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .review-date {
          font-size: 12px;
          color: var(--color-text-dim);
        }
        .review-comment-text {
          font-size: 14px;
          color: var(--color-text-muted);
        }
        .write-review-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 32px;
        }
        .write-review-card h3 {
          margin-bottom: 24px;
          font-size: 18px;
        }
        .review-login-prompt {
          text-align: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 40px;
          color: var(--color-text-muted);
        }
        .review-login-prompt p {
          margin: 12px 0 24px 0;
          font-size: 14px;
        }
        .error-banner {
          background: rgba(219, 68, 55, 0.15);
          border: 1px solid var(--color-error);
          color: var(--color-error);
          padding: 12px;
          border-radius: var(--border-radius-md);
          margin-bottom: 16px;
          font-size: 13px;
        }
        .success-banner {
          background: rgba(82, 164, 71, 0.15);
          border: 1px solid var(--color-success);
          color: var(--color-success);
          padding: 12px;
          border-radius: var(--border-radius-md);
          margin-bottom: 16px;
          font-size: 13px;
        }

        .mobile-sticky-actions {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border-top: 1px solid var(--border-color);
          padding: 12px 20px;
          gap: 12px;
          z-index: 100;
          box-shadow: 0 -4px 10px rgba(0,0,0,0.1);
        }
        @media (max-width: 768px) {
          .mobile-sticky-actions {
            display: flex;
          }
          .product-detail-layout {
            margin-bottom: 100px; /* Space for sticky bar */
          }
        }
      `}</style>
    </div>
  );
}
